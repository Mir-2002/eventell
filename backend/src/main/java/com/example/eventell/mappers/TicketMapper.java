package com.example.eventell.mappers;

import com.example.eventell.domain.dto.GetTicketResponseDto;
import com.example.eventell.domain.dto.ListTicketResponseDto;
import com.example.eventell.domain.dto.ListTicketTicketTypeResponseDto;
import com.example.eventell.domain.entities.Ticket;
import com.example.eventell.domain.entities.TicketType;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface TicketMapper {

    ListTicketTicketTypeResponseDto toListTicketTicketTypeResponseDto(TicketType ticketType);

    @Mapping(target = "ticketType", source = "type")
    ListTicketResponseDto toListTicketResponseDto(Ticket ticket);

    @Mapping(target = "price", source = "type.price")
    @Mapping(target = "description", source = "type.description")
    @Mapping(target = "eventName", source = "type.event.name")
    @Mapping(target = "eventVenue", source = "type.event.venue")
    @Mapping(target = "eventStart", source = "type.event.start")
    @Mapping(target = "eventEnd", source = "type.event.end")
    GetTicketResponseDto toGetTicketResponseDto(Ticket ticket);
}
