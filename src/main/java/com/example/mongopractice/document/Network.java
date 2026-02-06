package com.example.mongopractice.document;

import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Network enum with lowercase values for MongoDB schema validation.
 * MongoDB stores the actual enum name by default, so we use lowercase names.
 */
public enum Network {
    ethereum,
    polygon,
    arbitrum,
    optimism;

    @JsonValue
    public String getValue() {
        return name();
    }
}
