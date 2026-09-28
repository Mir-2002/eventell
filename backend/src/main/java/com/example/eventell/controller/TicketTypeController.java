package com.example.eventell.controller;

import com.example.eventell.service.TicketTypeService;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = "/api/v1/events/{eventId}/ticket-types")
@RequiredArgsConstructor
public class TicketTypeController {

    private final TicketTypeService ticketTypeService;

    @PostMapping(path = "/{ticketTypeId}/tickets")
    public ResponseEntity<Void> purchaseTicket(
        @AuthenticationPrincipal Jwt jwt,
        @PathVariable UUID eventId,
        @PathVariable UUID ticketTypeId
    ) {
        UUID userId = parseUserId(jwt);
        ticketTypeService.purchaseTicket(userId, eventId, ticketTypeId);
        return ResponseEntity.noContent().build();
    }

    private UUID parseUserId(Jwt jwt){
        return UUID.fromString(jwt.getSubject());
    }
}
