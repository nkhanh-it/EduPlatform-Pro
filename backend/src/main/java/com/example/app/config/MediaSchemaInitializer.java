package com.example.app.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class MediaSchemaInitializer {

    @Bean
    public CommandLineRunner ensureMediaSchema(JdbcTemplate jdbcTemplate) {
        return args -> {
            jdbcTemplate.execute("ALTER TABLE media_files ADD COLUMN IF NOT EXISTS hls_directory VARCHAR(255)");
            jdbcTemplate.execute("ALTER TABLE media_files ADD COLUMN IF NOT EXISTS hls_ready BOOLEAN NOT NULL DEFAULT FALSE");
            jdbcTemplate.execute("ALTER TABLE media_files ADD COLUMN IF NOT EXISTS hls_processing BOOLEAN NOT NULL DEFAULT FALSE");
        };
    }
}
