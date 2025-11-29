//package com.example.Minor_Project;
//
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.security.config.annotation.web.builders.HttpSecurity;
//import org.springframework.security.config.http.SessionCreationPolicy;
//import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
//import org.springframework.security.crypto.password.NoOpPasswordEncoder;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.security.web.SecurityFilterChain;
//
//import static org.springframework.security.config.Customizer.withDefaults;
//
//@Configuration
//public class SecurityConfiguration {
//
//    @Bean
//    public PasswordEncoder getEncoder(){    //PasswordEncoder is an interface which has many implementation classes ,it basically encrypts the credentials.I am returning NoOpPasswordEncoder since i dont want to store encrypted value and i want to use unencrypted credentials
//
//        return NoOpPasswordEncoder.getInstance();   //returning NoOpPasswordEncoder means ,this doesnot  encrypt password
//    }
//
//    @Bean       //SecurityFilterChain is used for authorisation as per Authority of UserDetails
//    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception{
//        http.cors(withDefaults()) // IMPORTANT: Enable CORS first
//                .authorizeHttpRequests(authorize->authorize
//                        .requestMatchers("/user/student").permitAll()  // Only student registration is public
//                        .requestMatchers("/user/admin").hasAuthority("ADMIN")  // Only admins can create admins
//                        .requestMatchers("/transaction/issue").hasAuthority("STUDENT")  //we can also put like "/transaction/issue/**" which means a path followed by any
//                        .requestMatchers("/transaction/return").hasAuthority("ADMIN")    //these means all these apis can be accessed only by allowed authorities
//                        .requestMatchers("/book").hasAuthority("ADMIN")
//                        .requestMatchers("/book/all").authenticated()
////                        .anyRequest().permitAll()) //we literally permitted all other methods as permitAll.We didnot bother about POSTAPI authentications also,bcoz we need CSRF token,else it wont open that POST itself
//                        .anyRequest().authenticated()) //allows only authenticated users
//
//                // Use only httpBasic for API
//                .httpBasic(basic -> basic
//                        .realmName("Library Management System")
//                )
//
//                // Stateless session for REST API
//                .sessionManagement(session -> session
//                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
//                )
//
//////                .formLogin(withDefaults())  //this ensures that it can be opened in browser itself
////                .httpBasic(withDefaults()) //this is used when we develop with only as backend,cause in most of the cases ,frontend will be built separately and backend separately, so it shouldnot redirect to a login page as its not required in this case and could be done only with API clients like postman.So if someone hits localhost:8080/Spring_Security in postman, he will not be redirected to login instead throws 401 error unauthorised
//                .csrf(csrf-> csrf.disable());   //this is done only for testing purpose.This should be removed when our testing is done.Else other than GET methods ,for all methods it shows 403 error.This was disabled by us for testing API's which modifies resources,like POST,PUT,DELETE,PATCH API ,since these API's need csrf token for working and e cannot provide csrf token in postman each time
//        return http.build();
//    }
//
//}


package com.example.Minor_Project;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
public class SecurityConfiguration {

    @Bean
    public PasswordEncoder getEncoder(){
        return NoOpPasswordEncoder.getInstance();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000", "http://localhost:5173"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

//    @Bean
//    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception{
//        http
//                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
//                .authorizeHttpRequests(authorize -> authorize
//                        // Public endpoints - no authentication required
//                        .requestMatchers("/health", "/test-auth", "/debug/**").permitAll()
//                        .requestMatchers("/user/student").permitAll()
//
//                        // Admin only endpoints
//                        .requestMatchers("/user/admin").hasAuthority("ADMIN")
//                        .requestMatchers("/transaction/return").hasAuthority("ADMIN")
//                        .requestMatchers("/book").hasAuthority("ADMIN")
//
//                        // Student only endpoints
//                        .requestMatchers("/transaction/issue").hasAuthority("STUDENT")
//
//                        // Authenticated endpoints
//                        .requestMatchers("/book/all").authenticated()
//
//                        // All other requests need authentication
//                        .anyRequest().authenticated()
//                )
//                // Keep httpBasic but prevent browser popup
//                .httpBasic(basic -> basic
//                        .realmName("Library Management System")
//                        .authenticationEntryPoint((request, response, authException) -> {
//                            // Return 401 without WWW-Authenticate header to prevent browser popup
//                            response.setStatus(401);
//                            response.setContentType("application/json");
//                            response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Invalid credentials\"}");
//                        })
//                )
//                .sessionManagement(session -> session
//                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
//                )
//                .csrf(csrf -> csrf.disable());
//
//        return http.build();
//    }


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception{
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/health", "/test-auth", "/debug/**").permitAll()
                        .requestMatchers("/user/student").permitAll() // Public student registration

                        // Admin only
                        .requestMatchers("/user/admin").hasAuthority("ADMIN")
                        .requestMatchers("/transaction/return").hasAuthority("ADMIN")
                        .requestMatchers("/book").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/book/**").hasAuthority("ADMIN")


                        // Authenticated User Details (NEW)
                        .requestMatchers("/user/me", "/transaction/history").authenticated()


                        // Student specific
                        .requestMatchers("/transaction/issue").hasAnyAuthority("STUDENT", "ADMIN")
                        .requestMatchers("/book/all").authenticated()
                        .requestMatchers("/auth/**").permitAll()

                        .anyRequest().authenticated()
                )
                // ... rest of configuration (httpBasic, session, csrf) remains the same
                .httpBasic(basic -> basic
                        .realmName("Library Management System")
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(401);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Invalid credentials\"}");
                        })
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .csrf(csrf -> csrf.disable());

        return http.build();
    }
}