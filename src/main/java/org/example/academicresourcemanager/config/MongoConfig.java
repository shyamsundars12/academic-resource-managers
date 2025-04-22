package org.example.academicresourcemanager.config;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

import java.util.concurrent.TimeUnit;

@Configuration
@EnableMongoRepositories(basePackages = "org.example.academicresourcemanager.repository")
public class MongoConfig extends AbstractMongoClientConfiguration {

    @Value("${spring.data.mongodb.uri}")
    private String mongoUri;

    @Override
    public MongoClient mongoClient() {
        ConnectionString connectionString = new ConnectionString(mongoUri);
        
        MongoClientSettings settings = MongoClientSettings.builder()
                .applyConnectionString(connectionString)
                .applyToConnectionPoolSettings(builder -> 
                    builder.maxSize(50)
                           .minSize(5)
                           .maxWaitTime(120000, TimeUnit.MILLISECONDS)
                           .maxConnectionIdleTime(60000, TimeUnit.MILLISECONDS)
                           .maxConnectionLifeTime(1800000, TimeUnit.MILLISECONDS))
                .applyToSocketSettings(builder -> 
                    builder.connectTimeout(10000, TimeUnit.MILLISECONDS)
                           .readTimeout(10000, TimeUnit.MILLISECONDS))
                .applyToServerSettings(builder -> 
                    builder.heartbeatFrequency(15000, TimeUnit.MILLISECONDS)
                           .minHeartbeatFrequency(5000, TimeUnit.MILLISECONDS))
                .applyToClusterSettings(builder ->
                    builder.serverSelectionTimeout(30000, TimeUnit.MILLISECONDS)
                           .localThreshold(15, TimeUnit.MILLISECONDS))
                .build();

        return MongoClients.create(settings);
    }

    @Override
    protected String getDatabaseName() {
        return "academicresource-db";
    }
} 