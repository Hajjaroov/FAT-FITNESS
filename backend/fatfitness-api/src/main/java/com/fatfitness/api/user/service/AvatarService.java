package com.fatfitness.api.user.service;

import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Set;
import java.util.UUID;

import javax.imageio.ImageIO;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.fatfitness.api.user.entity.UserAccount;
import com.fatfitness.api.user.entity.UserStatus;
import com.fatfitness.api.user.repository.UserAccountRepository;

@Service
public class AvatarService {

	private static final int AVATAR_SIZE = 256;
	private static final long MAX_FILE_BYTES = 8L * 1024 * 1024;
	private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png", "image/webp");

	private final UserAccountRepository userAccountRepository;

	public AvatarService(UserAccountRepository userAccountRepository) {
		this.userAccountRepository = userAccountRepository;
	}

	@Transactional
	public void uploadAvatar(UUID userId, MultipartFile file) throws IOException {
		if (file.isEmpty()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is empty.");
		}
		if (file.getSize() > MAX_FILE_BYTES) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is too large (max 8 MB).");
		}
		String contentType = file.getContentType();
		if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
			throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE,
					"Only JPEG, PNG, and WebP images are accepted.");
		}

		BufferedImage original = ImageIO.read(file.getInputStream());
		if (original == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot read image data.");
		}

		BufferedImage resized = new BufferedImage(AVATAR_SIZE, AVATAR_SIZE, BufferedImage.TYPE_INT_RGB);
		Graphics2D g = resized.createGraphics();
		g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
		g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
		g.drawImage(original, 0, 0, AVATAR_SIZE, AVATAR_SIZE, null);
		g.dispose();

		ByteArrayOutputStream out = new ByteArrayOutputStream();
		ImageIO.write(resized, "jpeg", out);

		UserAccount user = requireActiveUser(userId);
		user.updateAvatar(out.toByteArray());
	}

	public byte[] getAvatar(UUID userId) {
		UserAccount user = userAccountRepository.findById(userId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));
		byte[] avatar = user.getAvatarJpeg();
		if (avatar == null) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No avatar set.");
		}
		return avatar;
	}

	private UserAccount requireActiveUser(UUID userId) {
		UserAccount user = userAccountRepository.findById(userId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));
		if (user.getStatus() != UserStatus.ACTIVE) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is not active.");
		}
		return user;
	}
}
