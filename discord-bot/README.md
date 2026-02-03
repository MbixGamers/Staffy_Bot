# Discord Application Bot 🤖

A powerful Discord bot for managing applications with multi-server support, customizable categories, and advanced admin controls.

## ✨ Features

### Core Features
- 📋 **Multi-Category Applications** - Support for multiple application types (Staff, Moderator, HR, etc.)
- 🔒 **Multi-Server Support** - Each server has isolated configuration and data
- ⏰ **Cooldown System** - Prevent spam with configurable cooldown (default: 24 hours)
- 🎭 **Auto-Role Assignment** - Automatically assign roles when applications are accepted
- 🎫 **Ticket System** - Create private channels for discussing applications
- 📊 **Application History** - Track all past applications per user
- 💬 **DM-Based Applications** - Private application process via Direct Messages
- ⚡ **Slash Commands** - Modern Discord interaction system
- 👥 **Multiple Admin Roles** - Set up multiple admin roles for flexibility
- ❓ **Advanced Question System** - Up to 20 questions per category with text or yes/no types

### Admin Features
- ✅ Accept/Deny applications with custom reasons
- 📝 Customizable questions per category (up to 20)
- ➕ Add questions individually with type selection
- 🗑️ Remove specific questions by number
- 📋 List all questions for any category
- 🎯 Role-based permissions
- 👥 Multiple admin role support
- 📊 Application tracking and history
- 🎫 One-click ticket creation
- ⚙️ Easy server configuration
- 📚 Comprehensive help command

## 🚀 Setup Instructions

### Prerequisites
- Node.js v16.9.0 or higher
- A Discord Bot Token
- Administrator permissions in your Discord server

### Step 1: Bot Creation (If you haven't already)

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to "Bot" section and click "Add Bot"
4. Enable these intents:
   - ✅ Presence Intent
   - ✅ Server Members Intent
   - ✅ Message Content Intent
5. Copy the bot token
6. Go to "OAuth2" > "URL Generator"
   - Select scopes: `bot` and `applications.commands`
   - Select permissions: `Administrator` (or customize)
   - Copy the generated URL and invite the bot to your server

### Step 2: Installation

```bash
cd /app/discord-bot
npm install
```

### Step 3: Configuration

The `.env` file is already configured with your bot credentials:
- Bot Token: Already set
- Client ID: Already set

### Step 4: Register Commands

```bash
npm run register
```

You should see: "Successfully reloaded application (/) commands globally."

### Step 5: Start the Bot

```bash
npm start
```

You should see: "✅ Bot is ready! Logged in as [Your Bot Name]"

## 📖 Usage Guide

### Initial Server Setup

1. **View all commands** (Everyone):
   ```
   /help
   ```
   Shows complete command guide with examples

2. **Setup the bot** (Admin only):
   ```
   /setup log_channel:#applications admin_role:@Staff
   ```
   This creates the default "Staff" application category.

3. **Add additional admin roles** (Admin only):
   ```
   /addadminrole role:@Moderator
   /addadminrole role:@Manager
   ```

4. **Set ticket category** (Optional but recommended):
   ```
   /setticketcategory category:[Category Name]
   ```

5. **Deploy the application panel**:
   ```
   /panel
   ```
   or
   ```
   /panel channel:#applications
   ```

### Managing Categories

**Add a new category:**
```
/addcategory name:Moderator description:"Apply for Moderator position" role:@Moderator
```

**Remove a category:**
```
/removecategory category:Moderator
```

### Managing Questions (NEW!)

**Add a question to a category:**
```
/addquestion category:Staff question:"What timezone are you in?" type:Text
```

**Add a yes/no question:**
```
/addquestion category:Staff question:"Can you commit to 10+ hours weekly?" type:Yes/No
```

**List all questions:**
```
/listquestions category:Staff
```

**Remove a specific question:**
```
/removequestion category:Staff question_number:3
```

**Quick edit first 5 questions:**
```
/editquestions category:Staff
```
(A modal will appear to edit the first 5 questions)

**Note:** Each category can have up to 20 questions!

### Managing Admin Roles

**Add an admin role:**
```
/addadminrole role:@Moderator
```

**Remove an admin role:**
```
/removeadminrole role:@Helper
```

**View all admin roles:**
```
/viewconfig
```

### Configuration Commands

**View current config:**
```
/viewconfig
```

**Change log channel:**
```
/setlogchannel channel:#new-applications
```

**Set cooldown:**
```
/setcooldown hours:48
```
(Set to 0 to disable cooldown)

### User Application Flow

1. User clicks the application panel dropdown
2. Selects the application type (e.g., "Staff")
3. Bot sends DM with instructions
4. User answers questions in DM
5. Application is submitted to log channel
6. Admins review and take action

### Admin Review Process

 When an application arrives in the log channel, admins see 4 buttons:

1. **✅ Accept** - Opens modal for acceptance reason → DMs user → Assigns role (if configured)
2. **❌ Deny** - Opens modal for denial reason → DMs user
3. **📋 History** - Shows all past applications from this user
4. **🎫 Open Ticket** - Creates a private channel with the applicant and admins

## 📁 File Structure

```
discord-bot/
├── index.js              # Main bot file
├── init.js               # Command registration
├── package.json          # Dependencies
├── .env                  # Bot credentials
├── config/
│   └── servers/          # Per-server configs (auto-generated)
│       └── {guildId}.json
├── data/
│   ├── applications/     # Application data (auto-generated)
│   │   └── {guildId}.json
│   └── cooldowns/        # Cooldown tracking (auto-generated)
│       └── {guildId}.json
└── README.md
```

## 🎯 Default Configuration

When you run `/setup`, the bot creates a default configuration:

```json
{
  "guildId": "your_server_id",
  "logChannelId": "log_channel_id",
  "ticketCategoryId": null,
  "adminRoleIds": ["admin_role_id"],
  "cooldownHours": 24,
  "categories": [
    {
      "name": "Staff",
      "description": "Apply to become a staff member",
      "roleId": null,
      "questions": [
        { "text": "What is your name?", "type": "text" },
        { "text": "How old are you?", "type": "text" },
        { "text": "Why do you want to join the staff team?", "type": "text" },
        { "text": "Do you have any previous staff experience?", "type": "yes_no" },
        { "text": "How many hours per week can you dedicate?", "type": "text" }
      ]
    }
  ]
}
```

## 🔧 Customization Examples

### Adding Multiple Categories

```bash
# Add Moderator role
/addcategory name:Moderator description:"Moderate the community" role:@Moderator

# Add HR role
/addcategory name:HR description:"Human Resources position" role:@HR

# Add Event Staff
/addcategory name:"Event Staff" description:"Help organize events" role:@Event-Staff
```

### Setting Up Ticket Category

1. Create a category in Discord called "Tickets" or "Support"
2. Run:
   ```
   /setticketcategory category:[Select the Tickets category]
   ```

## ⚠️ Important Notes

- **DMs Must Be Enabled**: Users must allow DMs from server members to apply
- **Bot Permissions**: Ensure bot has:
  - Manage Channels (for ticket creation)
  - Manage Roles (for auto-role assignment)
  - Send Messages, Embed Links, Read Messages
- **Data Storage**: All data is stored locally in JSON files
- **Multi-Server**: Each server has completely isolated data

## 🐛 Troubleshooting

**Bot not responding to commands:**
- Make sure you ran `npm run register`
- Wait a few minutes for Discord to sync commands globally
- Check bot has proper permissions

**Can't DM users:**
- User must enable "Allow direct messages from server members"
- Check bot's DM permissions

**Ticket creation fails:**
- Run `/setticketcategory` first
- Ensure bot has "Manage Channels" permission
- Check the category exists and bot can access it

**Role assignment not working:**
- Ensure bot's role is higher than the role being assigned
- Check "Manage Roles" permission
- Verify roleId is set in category config

## 📝 Command Reference

| Command | Description | Admin Only |
|---------|-------------|------------|
| `/help` | Show all commands and usage guide | ❌ |
| `/setup` | Initial bot configuration | ✅ |
| `/panel` | Deploy application panel | ❌ |
| `/addcategory` | Add new application type | ✅ |
| `/removecategory` | Remove application type | ✅ |
| `/addquestion` | Add question to category (max 20) | ✅ |
| `/removequestion` | Remove question by number | ✅ |
| `/listquestions` | View all questions for category | ✅ |
| `/editquestions` | Quick edit first 5 questions | ✅ |
| `/addadminrole` | Add additional admin role | ✅ |
| `/removeadminrole` | Remove an admin role | ✅ |
| `/setlogchannel` | Change log channel | ✅ |
| `/setticketcategory` | Set ticket category | ✅ |
| `/viewconfig` | View current configuration | ✅ |
| `/setcooldown` | Set application cooldown | ✅ |

## 🎉 Features in Action

1. **User Experience**: Simple dropdown → DM questions → Submit
2. **Admin Dashboard**: All applications in one channel with action buttons
3. **Auto-Role**: Accepted users automatically get their role
4. **History Tracking**: See if user has applied before
5. **Private Discussions**: Open tickets for interviews or questions
6. **Cooldown Protection**: Prevent spam applications

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section
2. Verify all permissions are set correctly
3. Check console logs for error messages
4. Ensure Discord.js is properly installed

## 🔄 Updates

To update the bot:
```bash
npm update
```

Then restart the bot.

---

**Made with ❤️ using discord.js v14**