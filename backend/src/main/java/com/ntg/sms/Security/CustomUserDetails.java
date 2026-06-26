package com.ntg.sms.Security;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import com.ntg.sms.entities.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collection;
import java.util.List;
@RequiredArgsConstructor
@Getter
public class CustomUserDetails  implements UserDetails{
    private final  User user;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(
                new SimpleGrantedAuthority("Role_"+user.getRole().getRoleName())
        );
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }

    @Override
    public String getPassword(){
        return user.getPassword();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked(){
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return !Boolean.TRUE.equals(user.getIsDeleted());
    }

    public Long getId() {
        return user.getId();
    }
}