package com.fatfitness.api.messaging.dto;

/**
 * How an owner/admin announcement is delivered to members.
 *
 * <ul>
 *   <li>{@code PM} — create a private inbox conversation only, no email.</li>
 *   <li>{@code EMAIL} — send a one-off announcement email only, no inbox conversation.</li>
 *   <li>{@code BOTH} — create the inbox conversation and email a pointer to it.</li>
 * </ul>
 */
public enum BroadcastChannel {
	PM,
	EMAIL,
	BOTH
}
