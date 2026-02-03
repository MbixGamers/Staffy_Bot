# Discord Application Bot

## Overview

This is a Discord bot for managing applications within Discord servers. It provides a complete application system where users can apply for various roles (Staff, Moderator, HR, etc.) through DM-based questionnaires, and admins can review, accept, or deny applications through an organized channel-based workflow.

Key capabilities:
- Multi-server support with isolated configurations per guild
- Customizable application categories with up to 20 questions each
- DM-based private application process
- Cooldown system to prevent spam
- Auto-role assignment on application acceptance
- Ticket system for discussing applications
- Slash command interface

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Bot Framework
- **Discord.js v14**: Modern Discord API wrapper using slash commands and interaction-based UI components (dropdowns, buttons, modals)
- **Node.js runtime**: Single entry point at `discord-bot/index.js`

### Data Storage Pattern
- **File-based JSON storage**: No database required
- Server configs stored in `discord-bot/config/servers/{guildId}.json`
- Application submissions stored in `discord-bot/data/applications/{guildId}.json`
- User cooldowns stored in `discord-bot/data/cooldowns/{guildId}.json`
- This approach enables multi-server isolation without external database dependencies

### Command Registration
- Separate initialization script (`discord-bot/init.js`) registers slash commands with Discord API
- Commands defined as JSON objects following Discord's application command structure
- Run once via `npm run register` before bot startup

### Application Flow
1. Admin runs `/setup` to configure log channel and admin roles
2. Admin runs `/panel` to deploy application embed with dropdown menu
3. User selects category from dropdown → Bot DMs user questions sequentially
4. Completed application posts to log channel with Accept/Deny buttons
5. Admin reviews and takes action → User notified of outcome

### Configuration Schema
Each server config contains:
- `guildId`: Server identifier
- `logChannelId`: Where applications are posted for review
- `ticketCategoryId`: Discord category for ticket channels
- `adminRoleIds`: Array of roles that can review applications
- `cooldownHours`: Time between applications per user
- `categories`: Array of application types, each with name, description, roleId, and questions array

## External Dependencies

### NPM Packages
- **discord.js ^14.25.1**: Discord API client library
- **dotenv ^17.2.3**: Environment variable loading from `.env` file

### Required Environment Variables
- `DISCORD_TOKEN`: Bot authentication token from Discord Developer Portal
- `CLIENT_ID`: Application client ID for command registration

### Discord API Requirements
- Bot must have these gateway intents enabled: Guilds, GuildMessages, DirectMessages, MessageContent
- Bot requires permissions: Administrator (or Manage Channels + Manage Roles + Send Messages)
- Slash commands registered globally via REST API