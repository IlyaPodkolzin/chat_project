import React from 'react';
import { Link } from 'react-router-dom';
import { ListItem, ListItemIcon, ListItemText } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';

<>
  <ListItem button component={Link} to="/create-group-chat">
    <ListItemIcon>
      <AddIcon />
    </ListItemIcon>
    <ListItemText primary="Создать чат" />
  </ListItem>
  <ListItem button component={Link} to="/group-chats">
    <ListItemIcon>
      <SearchIcon />
    </ListItemIcon>
    <ListItemText primary="Поиск чатов" />
  </ListItem>
</> 