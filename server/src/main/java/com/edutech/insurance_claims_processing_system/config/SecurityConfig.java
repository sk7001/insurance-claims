package com.edutech.insurance_claims_processing_system.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.edutech.insurance_claims_processing_system.jwt.JwtRequestFilter;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    private final UserDetailsService userDetailsService;
    private final JwtRequestFilter jwtRequestFilter;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public SecurityConfig(UserDetailsService userDetailsService,
            JwtRequestFilter jwtRequestFilter,
            PasswordEncoder passwordEncoder) {
        this.userDetailsService = userDetailsService;
        this.jwtRequestFilter = jwtRequestFilter;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(userDetailsService).passwordEncoder(passwordEncoder);
    }

    @Override
    public void configure(HttpSecurity http) throws Exception {
        http.cors().and().csrf().disable()
                .authorizeHttpRequests()

                .antMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                .antMatchers("/api/user/register", "/api/user/login", "/api/user/forgot-password/**", "/api/user/verify").permitAll()

                // Profile accessible to any authenticated user
                .antMatchers("/api/user/profile/**").authenticated()

                .antMatchers("/api/chatbot/**").hasAuthority("POLICYHOLDER")

                .antMatchers("/api/policyholder/**").hasAuthority("POLICYHOLDER")
                .antMatchers("/api/adjuster/**").hasAuthority("ADJUSTER")
                .antMatchers("/api/investigator/**").hasAuthority("INVESTIGATOR")
                .antMatchers("/api/underwriter/**").hasAuthority("UNDERWRITER")
                .antMatchers("/api/admin/**").hasAuthority("ADJUSTER")

                .anyRequest().authenticated()
                .and()
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS);

        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);
    }

    @Bean
    @Override
    public AuthenticationManager authenticationManagerBean() throws Exception {
        return super.authenticationManagerBean();
    }
}