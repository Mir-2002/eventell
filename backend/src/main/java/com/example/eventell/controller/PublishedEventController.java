package com.example.eventell.controller;

import com.example.eventell.domain.dto.GetPublishedEventDetailsResponseDto;
import com.example.eventell.domain.dto.ListPublishedEventResponseDto;
import com.example.eventell.domain.entities.Event;
import com.example.eventell.mappers.EventMapper;
import com.example.eventell.service.EventService;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = "/api/v1/published-events")
@RequiredArgsConstructor
public class PublishedEventController {

    private final EventMapper eventMapper;
    private final EventService eventService;

    @GetMapping
    public ResponseEntity<Page<ListPublishedEventResponseDto>> listPublishedEvents(
        @RequestParam(required = false) String q,
        Pageable pageable
    ) {
        Page<Event> events;
        if (q != null && !q.isBlank()) {
            events = eventService.searchPublishedEvents(q.trim(), pageable);
        } else {
            events = eventService.listPublishedEvents(pageable);
        }
        return ResponseEntity.ok(events.map(eventMapper::toListPublishedEventResponseDto));
    }

    @GetMapping(path = "/{eventId}")
    public ResponseEntity<GetPublishedEventDetailsResponseDto> getPublishedEvent(
        @PathVariable UUID eventId
    ) {
        return eventService.getPublishedEvent(eventId)
            .map(eventMapper::toGetPublishedEventDetailsResponseDto)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
}
