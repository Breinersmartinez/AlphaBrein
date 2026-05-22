package com.example.bcrypt2025.model.enums;

// Enum para roles
public enum Role {


    /*
     * Las autorizaciones con JWT se manejan segun el rol.
     * Por ejemplo:
     * Si es un administrador, se autoriza realizar operaciones con:
     * @PreAuthorize("hasRole('ADMIN')")
     *
     * Si el metodo no tiene la notacion @PreAuthorize("hasRole('ROL')")
     * Tanto los usuarios como los administradores pueden realizar peticiones
     *    Los usuarios y administradores deben utilizar su respectivo tockend para poder realizar las peticiones

     *  */


    ADMIN,  // Reportes y gestión
    USER           // Cliente final




}
