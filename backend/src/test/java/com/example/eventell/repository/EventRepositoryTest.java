package com.example.eventell.repository;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.eventell.config.JpaConfiguration;
import com.example.eventell.domain.entities.Event;
import com.example.eventell.domain.entities.EventStatusEnum;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

@DataJpaTest
@Import(JpaConfiguration.class)
class EventRepositoryTest {

    @Autowired
    private EventRepository eventRepository;

    @BeforeEach
    void setUp() {
        eventRepository.save(event("Summer Jazz Night", "Riverside Park", EventStatusEnum.PUBLISHED));
        eventRepository.save(event("Tech Conference", "Jazz Hall", EventStatusEnum.PUBLISHED));
        eventRepository.save(event("Jazz Rehearsal", "Studio B", EventStatusEnum.DRAFT));
        eventRepository.save(event("Rock Festival", "Stadium", EventStatusEnum.PUBLISHED));
    }

    @Test
    void searchEventsMatchesNameOrVenueCaseInsensitively() {
        Page<Event> results = eventRepository.searchEvents(EventStatusEnum.PUBLISHED, "jazz", PageRequest.of(0, 10));

        assertThat(results.getContent())
            .extracting(Event::getName)
            .containsExactlyInAnyOrder("Summer Jazz Night", "Tech Conference");
    }

    @Test
    void findByStatusReturnsOnlyPublishedEvents() {
        Page<Event> results = eventRepository.findByStatus(EventStatusEnum.PUBLISHED, PageRequest.of(0, 10));

        assertThat(results.getTotalElements()).isEqualTo(3);
    }

    private Event event(String name, String venue, EventStatusEnum status) {
        return Event.builder().name(name).venue(venue).status(status).build();
    }
}
