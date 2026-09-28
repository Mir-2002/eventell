package com.example.eventell.controller;

import com.example.eventell.domain.dto.GetTicketResponseDto;
import com.example.eventell.domain.dto.ListTicketResponseDto;
import com.example.eventell.mappers.TicketMapper;
import com.example.eventell.service.QrCodeService;
import com.example.eventell.service.TicketService;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = "/api/v1/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketMapper ticketMapper;
    private final TicketService ticketService;
    private final QrCodeService qrCodeService;

    @GetMapping
    public ResponseEntity<Page<ListTicketResponseDto>> listTickets(
        @AuthenticationPrincipal Jwt jwt,
        Pageable pageable
    ) {
        UUID userId = parseUserId(jwt);
        return ResponseEntity.ok(
            ticketService.listTicketsForUser(userId, pageable).map(ticketMapper::toListTicketResponseDto)
        );
    }

    @GetMapping(path = "/{ticketId}")
    public ResponseEntity<GetTicketResponseDto> getTicket(
        @AuthenticationPrincipal Jwt jwt,
        @PathVariable UUID ticketId
    ) {
        UUID userId = parseUserId(jwt);
        return ticketService.getTicketForUser(userId, ticketId)
            .map(ticketMapper::toGetTicketResponseDto)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping(path = "/{ticketId}/qr-codes")
    public ResponseEntity<byte[]> getTicketQrCode(
        @AuthenticationPrincipal Jwt jwt,
        @PathVariable UUID ticketId
    ) {
        UUID userId = parseUserId(jwt);
        byte[] qrCodeImage = qrCodeService.getQrCodeImageForUserAndTicket(userId, ticketId);
        return ResponseEntity.ok()
            .contentType(MediaType.IMAGE_PNG)
            .contentLength(qrCodeImage.length)
            .body(qrCodeImage);
    }

    private UUID parseUserId(Jwt jwt){
        return UUID.fromString(jwt.getSubject());
    }
}
