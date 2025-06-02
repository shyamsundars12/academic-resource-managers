package org.example.academicresourcemanager.config;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Enumeration;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        try {
            // Log all request headers for debugging
            logger.debug("Request URI: {}", request.getRequestURI());
            logger.debug("Request Method: {}", request.getMethod());
            Enumeration<String> headerNames = request.getHeaderNames();
            while (headerNames.hasMoreElements()) {
                String headerName = headerNames.nextElement();
                logger.debug("Header - {}: {}", headerName, request.getHeader(headerName));
            }

            String authHeader = request.getHeader("Authorization");
            logger.debug("Authorization header: {}", authHeader);

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                logger.debug("No valid Authorization header found");
                chain.doFilter(request, response);
                return;
            }

            String jwt = authHeader.substring(7);
            logger.debug("Extracted JWT token: {}", jwt);

            if (jwt == null || jwt.trim().isEmpty()) {
                logger.debug("JWT token is null or empty");
                chain.doFilter(request, response);
                return;
            }

            try {
                String username = jwtService.extractUsername(jwt);
                logger.debug("Extracted username from JWT: {}", username);

                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                    logger.debug("Loaded user details for username: {}", username);

                    if (jwtService.isTokenValid(jwt, userDetails)) {
                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                        logger.debug("Authentication successful for user: {}", username);
                    } else {
                        logger.debug("Token validation failed for user: {}", username);
                    }
                }
            } catch (Exception e) {
                logger.error("Error processing JWT token: {}", e.getMessage(), e);
                SecurityContextHolder.clearContext();
            }
        } catch (Exception e) {
            logger.error("Error in JWT filter: {}", e.getMessage(), e);
            SecurityContextHolder.clearContext();
        }
        chain.doFilter(request, response);
    }
}
