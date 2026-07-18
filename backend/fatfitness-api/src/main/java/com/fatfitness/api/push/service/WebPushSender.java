package com.fatfitness.api.push.service;

import java.security.GeneralSecurityException;
import java.security.Security;

import org.apache.http.HttpResponse;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.stereotype.Component;

import com.fatfitness.api.config.PushProperties;

import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;

@Component
public class WebPushSender implements PushSender {

	private final PushService pushService;

	public WebPushSender(PushProperties properties) {
		if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
			Security.addProvider(new BouncyCastleProvider());
		}

		try {
			this.pushService = new PushService(
					properties.vapidPublicKey(), properties.vapidPrivateKey(), properties.vapidSubject());
		}
		catch (GeneralSecurityException ex) {
			throw new IllegalStateException("Invalid VAPID key configuration", ex);
		}
	}

	@Override
	public PushSendOutcome send(String endpoint, String p256dh, String auth, String payloadJson) throws Exception {
		Notification notification = new Notification(endpoint, p256dh, auth, payloadJson);
		HttpResponse response = pushService.send(notification);
		return new PushSendOutcome(response.getStatusLine().getStatusCode());
	}
}
