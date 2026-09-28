package com.example.eventell.controller;

import com.example.eventell.domain.dto.ErrorDto;
import com.example.eventell.exception.EventNotFoundException;
import com.example.eventell.exception.EventUpdateException;
import com.example.eventell.exception.QrCodeGenerationException;
import com.example.eventell.exception.QrCodeNotFoundException;
import com.example.eventell.exception.TicketNotFoundException;
import com.example.eventell.exception.TicketTypeNotFoundException;
import com.example.eventell.exception.TicketsSoldOutException;
import com.example.eventell.exception.UserNotFoundException;
import jakarta.validation.ConstraintViolationException;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(EventUpdateException.class)
    public ResponseEntity<ErrorDto> eventUpdateException(EventUpdateException exception) {
        log.error("Caught EventUpdateException", exception);
        ErrorDto errorDto = new ErrorDto();
        errorDto.setError("Unable to update event");
        return new ResponseEntity<>(errorDto, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(TicketTypeNotFoundException.class)
    public ResponseEntity<ErrorDto> ticketTypeNotFoundException(TicketTypeNotFoundException exception) {
        log.error("Caught TicketTypeNotFoundException", exception);
        ErrorDto errorDto = new ErrorDto();
        errorDto.setError("Ticket type not found");
        return new ResponseEntity<>(errorDto, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(EventNotFoundException.class)
    public ResponseEntity<ErrorDto> eventNotFoundException(EventNotFoundException exception) {
        log.error("Caught EventNotFoundException", exception);
        ErrorDto errorDto = new ErrorDto();
        errorDto.setError("Event not found");
        return new ResponseEntity<>(errorDto, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorDto> userNotFoundException(UserNotFoundException exception) {
        log.error("Caught UserNotFoundException", exception);
        ErrorDto errorDto = new ErrorDto();
        errorDto.setError("User not found");
        return new ResponseEntity<>(errorDto, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(TicketsSoldOutException.class)
    public ResponseEntity<ErrorDto> ticketsSoldOutException(TicketsSoldOutException exception) {
        log.error("Caught TicketsSoldOutException", exception);
        ErrorDto errorDto = new ErrorDto();
        errorDto.setError("Tickets are sold out for this ticket type");
        return new ResponseEntity<>(errorDto, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(TicketNotFoundException.class)
    public ResponseEntity<ErrorDto> ticketNotFoundException(TicketNotFoundException exception) {
        log.error("Caught TicketNotFoundException", exception);
        ErrorDto errorDto = new ErrorDto();
        errorDto.setError("Ticket not found");
        return new ResponseEntity<>(errorDto, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(QrCodeNotFoundException.class)
    public ResponseEntity<ErrorDto> qrCodeNotFoundException(QrCodeNotFoundException exception) {
        log.error("Caught QrCodeNotFoundException", exception);
        ErrorDto errorDto = new ErrorDto();
        errorDto.setError("QR code not found");
        return new ResponseEntity<>(errorDto, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(QrCodeGenerationException.class)
    public ResponseEntity<ErrorDto> qrCodeGenerationException(QrCodeGenerationException exception) {
        log.error("Caught QrCodeGenerationException", exception);
        ErrorDto errorDto = new ErrorDto();
        errorDto.setError("Unable to generate QR code");
        return new ResponseEntity<>(errorDto, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorDto> handleMethodArgumentNotValidException(MethodArgumentNotValidException exception) {
        log.error("Caught MethodArgumentNotValidException", exception);
        ErrorDto errorDto = new ErrorDto();

        BindingResult bindingResult = exception.getBindingResult();
        List<FieldError> fieldErrors = bindingResult.getFieldErrors();
        String errorMessage = fieldErrors.stream().findFirst().map(fieldError -> fieldError.getField() + ": " + fieldError.getDefaultMessage())
                .orElse("Validation error occurred: ");

        errorDto.setError(errorMessage);
        return new ResponseEntity<>(errorDto, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorDto> handleConstraintViolation(ConstraintViolationException exception) {
        log.error("Caught ConstraintViolationException", exception);
        ErrorDto errorDto = new ErrorDto();

        String errorMessage = exception.getConstraintViolations()
            .stream()
            .findFirst()
                .map(violation -> violation.getPropertyPath() +  ": " + violation.getMessage()).orElse("ConstraintViolation occured");

        errorDto.setError(errorMessage);
        return new ResponseEntity<>(errorDto, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorDto> handleMessageNotReadable(HttpMessageNotReadableException exception) {
        log.error("Caught HttpMessageNotReadableException", exception);
        ErrorDto errorDto = new ErrorDto();
        errorDto.setError("Malformed request body");
        return new ResponseEntity<>(errorDto, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorDto> handleMethodNotSupported(HttpRequestMethodNotSupportedException exception) {
        ErrorDto errorDto = new ErrorDto();
        errorDto.setError("Method not allowed");
        return new ResponseEntity<>(errorDto, HttpStatus.METHOD_NOT_ALLOWED);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorDto> handleNoResourceFound(NoResourceFoundException exception) {
        ErrorDto errorDto = new ErrorDto();
        errorDto.setError("Resource not found");
        return new ResponseEntity<>(errorDto, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorDto> handleException(Exception exception) {
        log.error("Caught exception", exception);
        ErrorDto errorDto = new ErrorDto();
        errorDto.setError("An unknown error occurred");
        return new ResponseEntity<>(errorDto, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
