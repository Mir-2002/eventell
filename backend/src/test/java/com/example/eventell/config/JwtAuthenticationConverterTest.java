package com.example.eventell.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

class JwtAuthenticationConverterTest {

    private final JwtAuthenticationConverter converter = new JwtAuthenticationConverter();

    @Test
    void mapsPrefixedRealmRolesToAuthorities() {
        Jwt jwt = jwt(Map.of("roles", List.of("ROLE_ORGANIZER", "ROLE_STAFF", "offline_access")));

        AbstractAuthenticationToken token = converter.convert(jwt);

        assertThat(token.getAuthorities())
            .extracting(GrantedAuthority::getAuthority)
            .containsExactlyInAnyOrder("ROLE_ORGANIZER", "ROLE_STAFF");
        assertThat(token.getName()).isEqualTo(jwt.getSubject());
    }

    @Test
    void returnsNoAuthoritiesWithoutRealmAccess() {
        Jwt jwt = Jwt.withTokenValue("token")
            .header("alg", "none")
            .subject(UUID.randomUUID().toString())
            .build();

        assertThat(converter.convert(jwt).getAuthorities()).isEmpty();
    }

    private Jwt jwt(Map<String, Object> realmAccess) {
        return Jwt.withTokenValue("token")
            .header("alg", "none")
            .subject(UUID.randomUUID().toString())
            .claim("realm_access", realmAccess)
            .build();
    }
}
