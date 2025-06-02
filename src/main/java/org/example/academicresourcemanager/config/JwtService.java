package org.example.academicresourcemanager.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class JwtService {

    private static final Logger logger = LoggerFactory.getLogger(JwtService.class);

    @Value("${jwt.secret}")
    private String jwtSecret;          // e.g. a 32+ byte plain‐text key, or a Base64 string

    @Value("${jwt.expiration}")
    private long jwtExpirationMillis;  // e.g. 3600000 for 1h

    private SecretKey signingKey;

    @PostConstruct
    public void init() {
        try {
            // Decode the Base64-encoded secret
            byte[] keyBytes = java.util.Base64.getDecoder().decode(jwtSecret);
            signingKey = Keys.hmacShaKeyFor(keyBytes);
            logger.debug("JWT signing key initialized successfully");
        } catch (Exception e) {
            logger.error("Error initializing JWT signing key: {}", e.getMessage());
            throw new RuntimeException("Failed to initialize JWT signing key", e);
        }
    }

    public String generateToken(UserDetails userDetails) {
        try {
            List<String> roles = userDetails.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList());

            Instant now = Instant.now();
            String token = Jwts.builder()
                    .setSubject(userDetails.getUsername())
                    .claim("roles", roles)
                    .setIssuedAt(Date.from(now))
                    .setExpiration(Date.from(now.plusMillis(jwtExpirationMillis)))
                    .signWith(signingKey, SignatureAlgorithm.HS256)
                    .compact();
            
            logger.debug("Generated JWT token for user: {}", userDetails.getUsername());
            return token;
        } catch (Exception e) {
            logger.error("Error generating JWT token: {}", e.getMessage());
            throw new RuntimeException("Failed to generate JWT token", e);
        }
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            Claims claims = parseAllClaims(token);
            String username = claims.getSubject();
            boolean isValid = username.equals(userDetails.getUsername()) &&
                    claims.getExpiration().after(new Date());
            
            logger.debug("Token validation result for user {}: {}", username, isValid);
            return isValid;
        } catch (Exception e) {
            logger.error("Error validating JWT token: {}", e.getMessage());
            return false;
        }
    }

    public String extractUsername(String token) {
        try {
            String username = parseAllClaims(token).getSubject();
            logger.debug("Extracted username from token: {}", username);
            return username;
        } catch (Exception e) {
            logger.error("Error extracting username from token: {}", e.getMessage());
            throw new RuntimeException("Failed to extract username from token", e);
        }
    }

    @SuppressWarnings("unchecked")
    public List<String> extractRoles(String token) {
        try {
            List<String> roles = (List<String>) parseAllClaims(token).get("roles");
            logger.debug("Extracted roles from token: {}", roles);
            return roles;
        } catch (Exception e) {
            logger.error("Error extracting roles from token: {}", e.getMessage());
            throw new RuntimeException("Failed to extract roles from token", e);
        }
    }

    private Claims parseAllClaims(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(signingKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            logger.debug("Successfully parsed JWT claims");
            return claims;
        } catch (Exception e) {
            logger.error("Error parsing JWT claims: {}", e.getMessage());
            throw new RuntimeException("Failed to parse JWT claims", e);
        }
    }
}
