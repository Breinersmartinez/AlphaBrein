package com.example.bcrypt2025.user.DTO;



import com.example.bcrypt2025.user.enums.IdentificationType;
import com.example.bcrypt2025.user.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// DTO para actualizar usuario
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRequest {
    private Integer idCard;
    //COMPOSICION
    private IdentificationType identificationType;
    private String firstName;
    private String lastName;
    private String email;
    private String password; // Opcional, solo si se quiere cambiar
    private String phoneNumber;
    private String direction;
    private Role role;
    private Boolean active;
}