package com.example.eventell.mappers;

import com.example.eventell.domain.CreateEventRequest;
import com.example.eventell.domain.CreateTicketTypeRequest;
import com.example.eventell.domain.dto.CreateEventRequestDto;
import com.example.eventell.domain.dto.CreateEventResponseDto;
import com.example.eventell.domain.dto.CreateTicketTypeRequestDto;
import com.example.eventell.domain.dto.CreateTicketTypeResponseDto;
import com.example.eventell.domain.entities.Event;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface EventMapper {

    CreateTicketTypeRequest fromDto(CreateTicketTypeRequestDto dto);

    CreateEventRequest fromDto(CreateEventRequestDto dto);

    CreateEventResponseDto toDto(Event event);

}
