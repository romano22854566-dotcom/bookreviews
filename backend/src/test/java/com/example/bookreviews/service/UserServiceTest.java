package com.example.bookreviews.service;

import com.example.bookreviews.dto.UserDto;
import com.example.bookreviews.dto.UserRequest;
import com.example.bookreviews.exception.ResourceNotFoundException;
import com.example.bookreviews.mapper.UserMapper;
import com.example.bookreviews.model.Role;
import com.example.bookreviews.model.User;
import com.example.bookreviews.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private UserService userService;

    private User testUser;
    private UserDto testUserDto;

    @BeforeEach
    void setUp() {
        testUser = new User("Иван", Role.USER);
        testUser.setId(1L);

        testUserDto = new UserDto(
                1L, "Иван", "USER",
                Collections.emptyList());
    }

    @Test
    @DisplayName("getAllUsers — возвращает список")
    void getAllUsers_returnsList() {
        when(userRepository.findAll())
                .thenReturn(List.of(testUser));
        when(userMapper.toDto(testUser))
                .thenReturn(testUserDto);

        List<UserDto> result = userService.getAllUsers();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Иван", result.get(0).name());
        assertEquals("USER", result.get(0).role());
    }

    @Test
    @DisplayName("getAllUsers — пустой список")
    void getAllUsers_empty() {
        when(userRepository.findAll())
                .thenReturn(Collections.emptyList());

        List<UserDto> result = userService.getAllUsers();

        assertTrue(result.isEmpty());
    }

    @Test
    @DisplayName("getUserById — успех")
    void getUserById_success() {
        when(userRepository.findWithDetailsById(1L))
                .thenReturn(Optional.of(testUser));
        when(userMapper.toDto(testUser))
                .thenReturn(testUserDto);

        UserDto result = userService.getUserById(1L);

        assertNotNull(result);
        assertEquals("Иван", result.name());
    }

    @Test
    @DisplayName("getUserById — не найден")
    void getUserById_notFound() {
        when(userRepository.findWithDetailsById(99L))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> userService.getUserById(99L));
    }

    @Test
    @DisplayName("createUser — с ролью USER")
    void createUser_withRole() {
        UserRequest request = new UserRequest("Пётр", Role.USER);

        User savedUser = new User("Пётр", Role.USER);
        savedUser.setId(2L);

        UserDto savedDto = new UserDto(
                2L, "Пётр", "USER",
                Collections.emptyList());

        when(userRepository.save(any(User.class)))
                .thenReturn(savedUser);
        when(userMapper.toDto(savedUser))
                .thenReturn(savedDto);

        UserDto result = userService.createUser(request);

        assertNotNull(result);
        assertEquals("Пётр", result.name());
        assertEquals("USER", result.role());
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("createUser — без роли, дефолт USER")
    void createUser_defaultRole() {
        UserRequest request = new UserRequest("Анна", null);

        User savedUser = new User("Анна", Role.USER);
        savedUser.setId(3L);

        UserDto savedDto = new UserDto(
                3L, "Анна", "USER",
                Collections.emptyList());

        when(userRepository.save(any(User.class)))
                .thenReturn(savedUser);
        when(userMapper.toDto(savedUser))
                .thenReturn(savedDto);

        UserDto result = userService.createUser(request);

        assertNotNull(result);
        assertEquals("USER", result.role());
    }

    @Test
    @DisplayName("createUser — с ролью ADMIN")
    void createUser_adminRole() {
        UserRequest request = new UserRequest("Админ", Role.ADMIN);

        User savedUser = new User("Админ", Role.ADMIN);
        savedUser.setId(4L);

        UserDto savedDto = new UserDto(
                4L, "Админ", "ADMIN",
                Collections.emptyList());

        when(userRepository.save(any(User.class)))
                .thenReturn(savedUser);
        when(userMapper.toDto(savedUser))
                .thenReturn(savedDto);

        UserDto result = userService.createUser(request);

        assertNotNull(result);
        assertEquals("ADMIN", result.role());
    }

    @Test
    @DisplayName("updateUser — успех")
    void updateUser_success() {
        UserRequest request =
                new UserRequest("Обновленный", Role.ADMIN);

        when(userRepository.findById(1L))
                .thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class)))
                .thenReturn(testUser);
        when(userMapper.toDto(any(User.class)))
                .thenReturn(new UserDto(
                        1L, "Обновленный", "ADMIN",
                        Collections.emptyList()));

        UserDto result =
                userService.updateUser(1L, request);

        assertNotNull(result);
        assertEquals("Обновленный", result.name());
        assertEquals("ADMIN", result.role());
    }

    @Test
    @DisplayName("updateUser — без смены роли")
    void updateUser_noRoleChange() {
        UserRequest request =
                new UserRequest("Новое имя", null);

        when(userRepository.findById(1L))
                .thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class)))
                .thenReturn(testUser);
        when(userMapper.toDto(any(User.class)))
                .thenReturn(new UserDto(
                        1L, "Новое имя", "USER",
                        Collections.emptyList()));

        UserDto result =
                userService.updateUser(1L, request);

        assertNotNull(result);
        assertEquals("Новое имя", result.name());
        assertEquals("USER", result.role());
    }

    @Test
    @DisplayName("updateUser — не найден")
    void updateUser_notFound() {
        UserRequest request =
                new UserRequest("Имя", Role.USER);

        when(userRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> userService.updateUser(99L, request));
    }

    @Test
    @DisplayName("deleteUser — успех")
    void deleteUser_success() {
        doNothing().when(userRepository).deleteById(1L);

        userService.deleteUser(1L);

        verify(userRepository).deleteById(1L);
    }
}