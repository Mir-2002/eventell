package com.example.eventell.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.example.eventell.domain.CreateEventRequest;
import com.example.eventell.domain.CreateTicketTypeRequest;
import com.example.eventell.domain.UpdateEventRequest;
import com.example.eventell.domain.UpdateTicketTypeRequest;
import com.example.eventell.domain.entities.Event;
import com.example.eventell.domain.entities.EventStatusEnum;
import com.example.eventell.domain.entities.TicketType;
import com.example.eventell.domain.entities.User;
import com.example.eventell.exception.EventNotFoundException;
import com.example.eventell.exception.EventUpdateException;
import com.example.eventell.exception.TicketTypeNotFoundException;
import com.example.eventell.repository.EventRepository;
import com.example.eventell.repository.UserRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class EventServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private EventRepository eventRepository;

    @InjectMocks
    private EventServiceImpl eventService;

    private UUID organizerId;
    private UUID eventId;
    private Event existingEvent;
    private TicketType keptTicketType;
    private TicketType removedTicketType;

    @BeforeEach
    void setUp() {
        organizerId = UUID.randomUUID();
        eventId = UUID.randomUUID();

        existingEvent = Event.builder()
            .id(eventId)
            .name("Old name")
            .venue("Old venue")
            .status(EventStatusEnum.DRAFT)
            .build();

        keptTicketType = TicketType.builder().id(UUID.randomUUID()).name("General").price(10.0)
            .event(existingEvent).build();
        removedTicketType = TicketType.builder().id(UUID.randomUUID()).name("VIP").price(50.0)
            .event(existingEvent).build();
        existingEvent.setTicketTypes(new ArrayList<>(List.of(keptTicketType, removedTicketType)));
    }

    @Test
    void createEventLinksTicketTypesToEvent() {
        User organizer = new User();
        organizer.setId(organizerId);
        when(userRepository.findById(organizerId)).thenReturn(Optional.of(organizer));
        when(eventRepository.save(any(Event.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CreateEventRequest request = new CreateEventRequest();
        request.setName("Concert");
        request.setVenue("Arena");
        request.setStatus(EventStatusEnum.DRAFT);
        request.setTicketTypes(List.of(new CreateTicketTypeRequest("General", 10.0, null, 100)));

        Event created = eventService.createEvent(organizerId, request);

        assertThat(created.getOrganizer()).isSameAs(organizer);
        assertThat(created.getTicketTypes()).hasSize(1);
        assertThat(created.getTicketTypes().get(0).getEvent()).isSameAs(created);
    }

    @Test
    void updateEventUpdatesCreatesAndRemovesTicketTypes() {
        when(eventRepository.findByIdAndOrganizerId(eventId, organizerId)).thenReturn(Optional.of(existingEvent));
        when(eventRepository.save(any(Event.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateEventRequest request = updateRequest(eventId, List.of(
            new UpdateTicketTypeRequest(keptTicketType.getId(), "General Admission", 15.0, "Standing", 200),
            new UpdateTicketTypeRequest(null, "Early Bird", 5.0, null, 50)
        ));

        Event updated = eventService.updateEventForOrganizer(organizerId, eventId, request);

        assertThat(updated.getName()).isEqualTo("New name");
        assertThat(updated.getStatus()).isEqualTo(EventStatusEnum.PUBLISHED);
        assertThat(updated.getTicketTypes()).hasSize(2).doesNotContain(removedTicketType);
        assertThat(keptTicketType.getName()).isEqualTo("General Admission");
        assertThat(keptTicketType.getPrice()).isEqualTo(15.0);

        TicketType newTicketType = updated.getTicketTypes().stream()
            .filter(ticketType -> ticketType.getId() == null)
            .findFirst()
            .orElseThrow();
        assertThat(newTicketType.getName()).isEqualTo("Early Bird");
        assertThat(newTicketType.getEvent()).isSameAs(existingEvent);
    }

    @Test
    void updateEventWithUnknownTicketTypeIdThrows() {
        when(eventRepository.findByIdAndOrganizerId(eventId, organizerId)).thenReturn(Optional.of(existingEvent));

        UpdateEventRequest request = updateRequest(eventId, List.of(
            new UpdateTicketTypeRequest(UUID.randomUUID(), "Ghost", 1.0, null, 1)
        ));

        assertThatThrownBy(() -> eventService.updateEventForOrganizer(organizerId, eventId, request))
            .isInstanceOf(TicketTypeNotFoundException.class);
        verify(eventRepository, never()).save(any());
    }

    @Test
    void updateEventWithMismatchedIdThrows() {
        UpdateEventRequest request = updateRequest(UUID.randomUUID(), List.of());

        assertThatThrownBy(() -> eventService.updateEventForOrganizer(organizerId, eventId, request))
            .isInstanceOf(EventUpdateException.class);
    }

    @Test
    void updateEventNotOwnedByOrganizerThrows() {
        when(eventRepository.findByIdAndOrganizerId(eventId, organizerId)).thenReturn(Optional.empty());

        UpdateEventRequest request = updateRequest(eventId, List.of());

        assertThatThrownBy(() -> eventService.updateEventForOrganizer(organizerId, eventId, request))
            .isInstanceOf(EventNotFoundException.class);
    }

    @Test
    void deleteEventDeletesOwnedEvent() {
        when(eventRepository.findByIdAndOrganizerId(eventId, organizerId)).thenReturn(Optional.of(existingEvent));

        eventService.deleteEventForOrganizer(organizerId, eventId);

        verify(eventRepository).delete(existingEvent);
    }

    @Test
    void deleteEventIgnoresEventNotOwnedByOrganizer() {
        when(eventRepository.findByIdAndOrganizerId(eventId, organizerId)).thenReturn(Optional.empty());

        eventService.deleteEventForOrganizer(organizerId, eventId);

        verify(eventRepository, never()).delete(any());
    }

    private UpdateEventRequest updateRequest(UUID id, List<UpdateTicketTypeRequest> ticketTypes) {
        UpdateEventRequest request = new UpdateEventRequest();
        request.setId(id);
        request.setName("New name");
        request.setVenue("New venue");
        request.setStatus(EventStatusEnum.PUBLISHED);
        request.setTicketTypes(new ArrayList<>(ticketTypes));
        return request;
    }
}
