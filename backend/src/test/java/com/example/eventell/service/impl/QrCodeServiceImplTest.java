package com.example.eventell.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.example.eventell.domain.entities.QrCode;
import com.example.eventell.domain.entities.QrCodeStatusEnum;
import com.example.eventell.domain.entities.Ticket;
import com.example.eventell.exception.QrCodeNotFoundException;
import com.example.eventell.repository.QrCodeRepository;
import com.google.zxing.BinaryBitmap;
import com.google.zxing.client.j2se.BufferedImageLuminanceSource;
import com.google.zxing.common.HybridBinarizer;
import com.google.zxing.qrcode.QRCodeReader;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.util.Optional;
import java.util.UUID;
import javax.imageio.ImageIO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class QrCodeServiceImplTest {

    @Mock
    private QrCodeRepository qrCodeRepository;

    @InjectMocks
    private QrCodeServiceImpl qrCodeService;

    @Test
    void generateQrCodeCreatesActiveQrCodeForTicket() {
        when(qrCodeRepository.save(any(QrCode.class))).thenAnswer(invocation -> invocation.getArgument(0));
        Ticket ticket = Ticket.builder().id(UUID.randomUUID()).build();

        QrCode qrCode = qrCodeService.generateQrCode(ticket);

        assertThat(qrCode.getStatus()).isEqualTo(QrCodeStatusEnum.ACTIVE);
        assertThat(qrCode.getTicket()).isSameAs(ticket);
        assertThat(UUID.fromString(qrCode.getValue())).isNotNull();
        assertThat(ticket.getQrCodes()).containsExactly(qrCode);
    }

    @Test
    void getQrCodeImageEncodesQrCodeValue() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID ticketId = UUID.randomUUID();
        QrCode qrCode = QrCode.builder().value(UUID.randomUUID().toString()).status(QrCodeStatusEnum.ACTIVE).build();
        when(qrCodeRepository.findFirstByTicketIdAndTicketPurchaserIdAndStatus(ticketId, userId, QrCodeStatusEnum.ACTIVE))
            .thenReturn(Optional.of(qrCode));

        byte[] image = qrCodeService.getQrCodeImageForUserAndTicket(userId, ticketId);

        BufferedImage bufferedImage = ImageIO.read(new ByteArrayInputStream(image));
        BinaryBitmap bitmap = new BinaryBitmap(new HybridBinarizer(new BufferedImageLuminanceSource(bufferedImage)));
        assertThat(new QRCodeReader().decode(bitmap).getText()).isEqualTo(qrCode.getValue());
    }

    @Test
    void getQrCodeImageForOtherUsersTicketThrows() {
        UUID userId = UUID.randomUUID();
        UUID ticketId = UUID.randomUUID();
        when(qrCodeRepository.findFirstByTicketIdAndTicketPurchaserIdAndStatus(ticketId, userId, QrCodeStatusEnum.ACTIVE))
            .thenReturn(Optional.empty());

        assertThatThrownBy(() -> qrCodeService.getQrCodeImageForUserAndTicket(userId, ticketId))
            .isInstanceOf(QrCodeNotFoundException.class);
    }
}
