package com.farmhand.enterprise;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan
public class FarmHandEnterpriseApplication {

	public static void main(String[] args) {
		SpringApplication.run(FarmHandEnterpriseApplication.class, args);
	}
}
