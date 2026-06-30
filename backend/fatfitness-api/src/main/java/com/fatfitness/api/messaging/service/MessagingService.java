package com.fatfitness.api.messaging.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.fatfitness.api.email.EmailService;
import com.fatfitness.api.messaging.dto.BroadcastMessageRequest;
import com.fatfitness.api.messaging.dto.BroadcastMessageResponse;
import com.fatfitness.api.messaging.dto.ConversationSummaryResponse;
import com.fatfitness.api.messaging.dto.ConversationThreadResponse;
import com.fatfitness.api.messaging.dto.MessageResponse;
import com.fatfitness.api.messaging.dto.ReplyMessageRequest;
import com.fatfitness.api.messaging.dto.StartConversationRequest;
import com.fatfitness.api.messaging.dto.UnreadCountResponse;
import com.fatfitness.api.messaging.entity.Conversation;
import com.fatfitness.api.messaging.entity.ConversationParticipant;
import com.fatfitness.api.messaging.entity.Message;
import com.fatfitness.api.messaging.repository.ConversationParticipantRepository;
import com.fatfitness.api.messaging.repository.ConversationRepository;
import com.fatfitness.api.messaging.repository.MessageRepository;
import com.fatfitness.api.user.entity.UserAccount;
import com.fatfitness.api.user.entity.UserRole;
import com.fatfitness.api.user.entity.UserStatus;
import com.fatfitness.api.user.repository.UserAccountRepository;
import com.fatfitness.api.user.service.UserPublicDisplayNameService;

@Service
public class MessagingService {

	private static final int PREVIEW_MAX_LENGTH = 140;
	private static final Set<UserRole> BROADCAST_ROLES = Set.of(UserRole.OWNER, UserRole.ADMIN);

	private final ConversationRepository conversationRepository;
	private final ConversationParticipantRepository participantRepository;
	private final MessageRepository messageRepository;
	private final UserAccountRepository userAccountRepository;
	private final UserPublicDisplayNameService userPublicDisplayNameService;
	private final EmailService emailService;

	public MessagingService(
			ConversationRepository conversationRepository,
			ConversationParticipantRepository participantRepository,
			MessageRepository messageRepository,
			UserAccountRepository userAccountRepository,
			UserPublicDisplayNameService userPublicDisplayNameService,
			EmailService emailService) {
		this.conversationRepository = conversationRepository;
		this.participantRepository = participantRepository;
		this.messageRepository = messageRepository;
		this.userAccountRepository = userAccountRepository;
		this.userPublicDisplayNameService = userPublicDisplayNameService;
		this.emailService = emailService;
	}

	@Transactional
	public ConversationThreadResponse startConversation(StartConversationRequest request, String userIdSubject) {
		UserAccount sender = requireActiveUser(userIdSubject);
		UserAccount recipient = userAccountRepository.findById(request.recipientId())
				.filter(user -> user.getStatus() == UserStatus.ACTIVE)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recipient not found"));

		if (recipient.getId().equals(sender.getId())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot message yourself");
		}

		Instant now = Instant.now();
		Conversation conversation = conversationRepository.save(new Conversation(cleanSingleLine(request.subject())));

		// The sender has read everything they just wrote; the recipient has not.
		participantRepository.save(new ConversationParticipant(conversation, sender, now));
		participantRepository.save(new ConversationParticipant(conversation, recipient, null));

		Message message = messageRepository.save(new Message(conversation, sender, cleanMultiline(request.body())));

		notifyRecipient(recipient, sender, conversation);

		return new ConversationThreadResponse(
				conversation.getId(),
				conversation.getSubject(),
				recipient.getId(),
				userPublicDisplayNameService.resolve(recipient),
				recipient.hasAvatar(),
				List.of(toMessageResponse(message)));
	}

	@Transactional
	public BroadcastMessageResponse broadcast(BroadcastMessageRequest request, String userIdSubject) {
		UserAccount sender = requireActiveUser(userIdSubject);
		if (sender.getRoles().stream().noneMatch(BROADCAST_ROLES::contains)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only an owner or admin can broadcast");
		}

		String subject = cleanSingleLine(request.subject());
		String body = cleanMultiline(request.body());
		Instant now = Instant.now();

		List<UserAccount> recipients = userAccountRepository.findByStatus(UserStatus.ACTIVE).stream()
				.filter(user -> !user.getId().equals(sender.getId()))
				.toList();

		// Each recipient gets their own 1-to-1 conversation, so replies come back only
		// to the announcing owner/admin rather than to every member.
		for (UserAccount recipient : recipients) {
			Conversation conversation = conversationRepository.save(new Conversation(subject));
			participantRepository.save(new ConversationParticipant(conversation, sender, now));
			participantRepository.save(new ConversationParticipant(conversation, recipient, null));
			messageRepository.save(new Message(conversation, sender, body));
			notifyRecipient(recipient, sender, conversation);
		}

		return new BroadcastMessageResponse(recipients.size());
	}

	@Transactional
	public MessageResponse reply(UUID conversationId, ReplyMessageRequest request, String userIdSubject) {
		UserAccount sender = requireActiveUser(userIdSubject);
		ConversationParticipant senderParticipant = participantRepository
				.findByConversationIdAndUserId(conversationId, sender.getId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conversation not found"));

		Conversation conversation = senderParticipant.getConversation();
		Message message = messageRepository.save(new Message(conversation, sender, cleanMultiline(request.body())));

		// Replying counts as reading; restore the sender's side if they had deleted it.
		senderParticipant.markRead();
		senderParticipant.restore();
		participantRepository.save(senderParticipant);

		// A new message brings the conversation back for the other participant and
		// marks it unread for them (reset to null so unread is independent of clock
		// resolution — a same-tick reply must still surface as unread).
		ConversationParticipant other = otherParticipant(conversationId, sender.getId());
		if (other != null) {
			other.restore();
			other.markUnread();
			participantRepository.save(other);
			notifyRecipient(other.getUser(), sender, conversation);
		}

		return toMessageResponse(message);
	}

	@Transactional(readOnly = true)
	public List<ConversationSummaryResponse> listInbox(String userIdSubject) {
		UserAccount user = requireActiveUser(userIdSubject);
		List<ConversationParticipant> mine = participantRepository.findByUserIdAndDeletedFalse(user.getId());

		List<ConversationSummaryResponse> summaries = new ArrayList<>();
		for (ConversationParticipant participant : mine) {
			Conversation conversation = participant.getConversation();
			Optional<Message> latest = messageRepository
					.findTopByConversationIdOrderBySentAtDesc(conversation.getId());
			if (latest.isEmpty()) {
				continue;
			}

			Message latestMessage = latest.get();
			ConversationParticipant other = otherParticipant(conversation.getId(), user.getId());
			UserAccount otherUser = other != null ? other.getUser() : user;

			summaries.add(new ConversationSummaryResponse(
					conversation.getId(),
					conversation.getSubject(),
					otherUser.getId(),
					userPublicDisplayNameService.resolve(otherUser),
					otherUser.hasAvatar(),
					preview(latestMessage.getBody()),
					latestMessage.getSentAt(),
					isUnread(participant, latestMessage, user.getId())));
		}

		// Newest conversation first. Plain lambda (not Comparator.comparing(method ref))
		// to avoid the null-analysis warning on the record accessor; lastMessageAt is
		// always non-null here because conversations with no messages are skipped above.
		summaries.sort((a, b) -> b.lastMessageAt().compareTo(a.lastMessageAt()));
		return summaries;
	}

	@Transactional
	public ConversationThreadResponse getThread(UUID conversationId, String userIdSubject) {
		UserAccount user = requireActiveUser(userIdSubject);
		ConversationParticipant participant = participantRepository
				.findByConversationIdAndUserId(conversationId, user.getId())
				.filter(p -> !p.isDeleted())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conversation not found"));

		Conversation conversation = participant.getConversation();
		ConversationParticipant other = otherParticipant(conversationId, user.getId());
		UserAccount otherUser = other != null ? other.getUser() : user;

		List<MessageResponse> messages = messageRepository
				.findByConversationIdOrderBySentAtAsc(conversationId)
				.stream()
				.map(this::toMessageResponse)
				.toList();

		// Opening the thread marks it read.
		participant.markRead();
		participantRepository.save(participant);

		return new ConversationThreadResponse(
				conversation.getId(),
				conversation.getSubject(),
				otherUser.getId(),
				userPublicDisplayNameService.resolve(otherUser),
				otherUser.hasAvatar(),
				messages);
	}

	@Transactional(readOnly = true)
	public UnreadCountResponse unreadCount(String userIdSubject) {
		UserAccount user = requireActiveUser(userIdSubject);
		long count = participantRepository.findByUserIdAndDeletedFalse(user.getId()).stream()
				.filter(participant -> messageRepository
						.findTopByConversationIdOrderBySentAtDesc(participant.getConversation().getId())
						.map(latest -> isUnread(participant, latest, user.getId()))
						.orElse(false))
				.count();
		return new UnreadCountResponse(count);
	}

	@Transactional
	public void deleteConversation(UUID conversationId, String userIdSubject) {
		UserAccount user = requireActiveUser(userIdSubject);
		ConversationParticipant participant = participantRepository
				.findByConversationIdAndUserId(conversationId, user.getId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conversation not found"));

		participant.softDelete();
		participantRepository.save(participant);
	}

	private void notifyRecipient(UserAccount recipient, UserAccount sender, Conversation conversation) {
		emailService.sendNewMessageEmail(
				recipient.getEmail(),
				recipient.getDisplayName(),
				userPublicDisplayNameService.resolve(sender),
				conversation.getSubject(),
				conversation.getId().toString());
	}

	private ConversationParticipant otherParticipant(UUID conversationId, UUID excludeUserId) {
		return participantRepository.findByConversationId(conversationId).stream()
				.filter(p -> !p.getUser().getId().equals(excludeUserId))
				.findFirst()
				.orElse(null);
	}

	private static boolean isUnread(ConversationParticipant participant, Message latestMessage, UUID userId) {
		if (latestMessage.getSender().getId().equals(userId)) {
			return false;
		}
		Instant lastReadAt = participant.getLastReadAt();
		return lastReadAt == null || latestMessage.getSentAt().isAfter(lastReadAt);
	}

	private MessageResponse toMessageResponse(Message message) {
		UserAccount sender = message.getSender();
		return new MessageResponse(
				message.getId(),
				message.getConversation().getId(),
				sender.getId(),
				userPublicDisplayNameService.resolve(sender),
				sender.hasAvatar(),
				message.getBody(),
				message.getSentAt());
	}

	private static String preview(String body) {
		String singleLine = body.replaceAll("\\s+", " ").trim();
		if (singleLine.length() <= PREVIEW_MAX_LENGTH) {
			return singleLine;
		}
		return singleLine.substring(0, PREVIEW_MAX_LENGTH - 1).trim() + "…";
	}

	private UserAccount requireActiveUser(String userIdSubject) {
		UserAccount user = userAccountRepository.findById(parseUserIdSubject(userIdSubject))
				.orElseThrow(MessagingService::invalidAccessToken);

		if (user.getStatus() != UserStatus.ACTIVE) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is not active");
		}

		return user;
	}

	private static String cleanSingleLine(String value) {
		return value.trim().replaceAll("\\s+", " ");
	}

	private static String cleanMultiline(String value) {
		return value.trim().replace("\r\n", "\n").replace('\r', '\n');
	}

	private static UUID parseUserIdSubject(String subject) {
		try {
			return UUID.fromString(subject);
		}
		catch (RuntimeException ex) {
			throw invalidAccessToken();
		}
	}

	private static ResponseStatusException invalidAccessToken() {
		return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid access token");
	}
}
