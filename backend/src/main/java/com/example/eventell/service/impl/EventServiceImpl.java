package com.example.eventell.service.impl;

import com.example.eventell.domain.CreateEventRequest;
import com.example.eventell.domain.UpdateEventRequest;
import com.example.eventell.domain.UpdateTicketTypeRequest;
import com.example.eventell.domain.entities.Event;
import com.example.eventell.domain.entities.TicketType;
import com.example.eventell.domain.entities.User;
import com.example.eventell.exception.EventNotFoundException;
import com.example.eventell.exception.EventUpdateException;
import com.example.eventell.exception.TicketTypeNotFoundException;
import com.example.eventell.exception.UserNotFoundException;
import com.example.eventell.repository.EventRepository;
import com.example.eventell.repository.UserRepository;
import com.example.eventell.service.EventService;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;

    @Override
    @Transactional
    public Event createEvent(UUID organizerId, CreateEventRequest event) {
        User organizer = userRepository.findById(organizerId).orElseThrow(
            () -> new UserNotFoundException(
                String.format("User with id %s not found", organizerId)
            )
        );
        List<TicketType> ticketTypesToCreate = event.getTicketTypes().stream().map(ticketType-> {
            TicketType ticketTypeToCreate = new TicketType();
            ticketTypeToCreate.setName(ticketType.getName());
            ticketTypeToCreate.setPrice(ticketType.getPrice());
            ticketTypeToCreate.setDescription(ticketType.getDescription());
            ticketTypeToCreate.setTotalAvailable(ticketType.getTotalAvailable());
            return ticketTypeToCreate;
        }).collect(Collectors.toList());
        Event eventToCreate = new Event();
        ticketTypesToCreate.forEach(ticketType -> ticketType.setEvent(eventToCreate));
        eventToCreate.setName(event.getName());
        eventToCreate.setStart(event.getStart());
        eventToCreate.setEnd(event.getEnd());
        eventToCreate.setVenue(event.getVenue());
        eventToCreate.setSalesStart(event.getSalesStart());
        eventToCreate.setSalesEnd(event.getSalesEnd());
        eventToCreate.setStatus(event.getStatus());
        eventToCreate.setOrganizer(organizer);
        eventToCreate.setTicketTypes(ticketTypesToCreate);

        return eventRepository.save(eventToCreate);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Event> listEventsForOrganizer(UUID organizerId, Pageable pageable) {
        return eventRepository.findByOrganizerId(organizerId, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Event> getEventForOrganizer(UUID organizerId, UUID id) {
        return eventRepository.findByIdAndOrganizerId(id, organizerId);
    }

    @Override
    @Transactional
    public Event updateEventForOrganizer(UUID organizerId, UUID id, UpdateEventRequest event) {
        if(event.getId() == null){
            throw new EventUpdateException("Event id not found");
        }

        if(id.equals(event.getId())){
            throw new EventUpdateException("Cannot update the ID of an event");
        }

        Event existingEvent = eventRepository.findByIdAndOrganizerId(id, organizerId)
            .orElseThrow(() -> new EventNotFoundException(String.format("Event with ID '%s' doesn't exist'", id)));

        existingEvent.setName(event.getName());
        existingEvent.setStart(event.getStart());
        existingEvent.setEnd(event.getEnd());
        existingEvent.setVenue(event.getVenue());
        existingEvent.setSalesStart(event.getSalesStart());
        existingEvent.setSalesEnd(event.getSalesEnd());
        existingEvent.setStatus(event.getStatus());

        Set<UUID> requestTicketTypeIds = event.getTicketTypes()
            .stream()
            .map(UpdateTicketTypeRequest::getId)
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());

        existingEvent.getTicketTypes()
            .removeIf(existingTicketType ->
                !requestTicketTypeIds.contains(existingTicketType.getId())
            );

        Map<UUID, TicketType> existingTicketTypesIndex = existingEvent.getTicketTypes().stream()
            .collect(Collectors.toMap(TicketType::getId, Function.identity()));

        for(UpdateTicketTypeRequest ticketType :  event.getTicketTypes()){
            if(ticketType.getId() == null){
                // Create
                TicketType ticketTypeToCreate = new TicketType();
                ticketTypeToCreate.setName(ticketType.getName());
                ticketTypeToCreate.setPrice(ticketType.getPrice());
                ticketTypeToCreate.setDescription(ticketType.getDescription());
                ticketTypeToCreate.setTotalAvailable(ticketType.getTotalAvailable());
                ticketTypeToCreate.setEvent(existingEvent);
                existingEvent.getTicketTypes().add(ticketTypeToCreate);
            } else if (existingTicketTypesIndex.containsKey(ticketType.getId())) {
                // Update
                TicketType existingTicketType = existingTicketTypesIndex.get(ticketType.getId());
                existingTicketType.setName(ticketType.getName());
                existingTicketType.setPrice(ticketType.getPrice());
                existingTicketType.setDescription(ticketType.getDescription());
                existingTicketType.setTotalAvailable(ticketType.getTotalAvailable());
            } else {
                throw new TicketTypeNotFoundException(String.format("Ticket type with ID '%s' doesn't exist", ticketType.getId()));
            }
        }

        return eventRepository.save(existingEvent);
    }


}
