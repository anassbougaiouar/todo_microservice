package com.example.todoservice.service;

import com.example.todoservice.entity.Todo;
import com.example.todoservice.repository.TodoRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class TodoService {

    private final TodoRepository todoRepository;

    public TodoService(TodoRepository todoRepository) {
        this.todoRepository = todoRepository;
    }

    public Todo create(Todo todo) {
        todo.setId(null);
        if (todo.getCompleted() == null) {
            todo.setCompleted(false);
        }
        return todoRepository.save(todo);
    }

    public List<Todo> findAll() {
        return todoRepository.findAll();
    }

    public List<Todo> findByUserId(Long userId) {
        return todoRepository.findByUserId(userId);
    }

    public Optional<Todo> update(Long id, Todo updatedTodo) {
        return todoRepository.findById(id).map(existingTodo -> {
            existingTodo.setTitle(updatedTodo.getTitle());
            existingTodo.setDescription(updatedTodo.getDescription());
            existingTodo.setCompleted(updatedTodo.getCompleted() != null && updatedTodo.getCompleted());
            existingTodo.setUserId(updatedTodo.getUserId());
            return todoRepository.save(existingTodo);
        });
    }

    public boolean delete(Long id) {
        if (!todoRepository.existsById(id)) {
            return false;
        }

        todoRepository.deleteById(id);
        return true;
    }
}
