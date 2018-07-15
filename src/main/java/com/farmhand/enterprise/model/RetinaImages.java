/**
 * 
 */
package com.farmhand.enterprise.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

/**
 * @author Helmut
 *
 */

@Entity
public class RetinaImages {
	@Id
	Long id;
	
	@Column(name = "firstname")
	private String firstName;
	
	@Column(name = "lastname")
	private String lastName;	

}
