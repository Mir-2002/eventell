package com.example.eventell.mappers;

import com.example.eventell.domain.CreateEventRequest;
import com.example.eventell.domain.CreateTicketTypeRequest;
import com.example.eventell.domain.dto.CreateEventRequestDto;
import com.example.eventell.domain.dto.CreateEventResponseDto;
import com.example.eventell.domain.dto.CreateTicketTypeRequestDto;
import com.example.eventell.domain.dto.CreateTicketTypeResponseDto;
import com.example.eventell.domain.dto.GetEventDetailsResponseDto;
import com.example.eventell.domain.dto.GetEventTicketTypesResponseDto;
import com.example.eventell.domain.dto.ListEventResponseDto;
import com.example.eventell.domain.dto.ListEventTicketTypeResponseDto;
import com.example.eventell.domain.entities.Event;
import com.example.eventell.domain.entities.TicketType;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface EventMapper {

    CreateTicketTypeRequest fromDto(CreateTicketTypeRequestDto dto);

    CreateEventRequest fromDto(CreateEventRequestDto dto);

    CreateEventResponseDto toDto(Event event);

    ListEventTicketTypeResponseDto toDto(TicketType  ticketType);

    ListEventResponseDto toListEventResponseDto (Event event);

    GetEventDetailsTicketTypesResponseDto toGetEventDetailsTicketTypesResponseDto(TicketType ticketType);

    GetEventDetailsResponseDto  toGetEventDetailsResponseDto(Event event);
}
