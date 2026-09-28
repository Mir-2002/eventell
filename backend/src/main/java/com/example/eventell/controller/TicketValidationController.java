package com.example.eventell.controller;

import com.example.eventell.domain.dto.TicketValidationRequestDto;
import com.example.eventell.domain.dto.TicketValidationResponseDto;
import com.example.eventell.domain.entities.TicketValidation;
import com.example.eventell.mappers.TicketValidationMapper;
import com.example.eventell.service.TicketValidationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = "/api/v1/ticket-validations")
@RequiredArgsConstructor
public class TicketValidationController {

    private final TicketValidationMapper ticketValidationMapper;
    private final TicketValidationService ticketValidationService;

    @PostMapping
    public ResponseEntity<TicketValidationResponseDto> validateTicket(
        @Valid @RequestBody TicketValidationRequestDto ticketValidationRequestDto
    ) {
        TicketValidation ticketValidation = switch (ticketValidationRequestDto.getMethod()) {
            case QR_SCAN -> ticketValidationService.validateTicketByQrCode(ticketValidationRequestDto.getId());
            case MANUAL -> ticketValidationService.validateTicketManually(ticketValidationRequestDto.getId());
        };

        return ResponseEntity.ok(ticketValidationMapper.toTicketValidationResponseDto(ticketValidation));
    }
}
