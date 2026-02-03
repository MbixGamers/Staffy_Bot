# Application Flow Diagram 📊

## Complete User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER PERSPECTIVE                             │
└─────────────────────────────────────────────────────────────────┘

1. User sees Application Panel
   │
   ├─> 📋 Embed with all categories listed
   └─> 🔽 Dropdown menu with options
   
2. User selects category (e.g., "Staff")
   │
   ├─> ✅ Bot confirms: "Check your DMs!"
   └─> 📩 DM arrives from bot
   
3. Bot sends application questions
   │
   ├─> Question 1/5: "What is your name?"
   │   └─> User types: "John Doe"
   │
   ├─> Question 2/5: "How old are you?"
   │   └─> User types: "25"
   │
   ├─> Question 3/5: "Why do you want to join?"
   │   └─> User types: "I love this community..."
   │
   ├─> Question 4/5: "Do you have experience?" [Yes/No buttons]
   │   └─> User clicks: "Yes"
   │
   └─> Question 5/5: "How many hours per week?"
       └─> User types: "15 hours"
       
4. Application submitted!
   │
   ├─> ✅ "Application Submitted!" message
   ├─> 🕐 Cooldown activated (24 hours)
   └─> ⏳ Waiting for admin review...


┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN PERSPECTIVE                             │
└─────────────────────────────────────────────────────────────────┘

5. Admin sees application in log channel
   │
   ├─> 📋 Embed with applicant info
   ├─> 📝 All answers displayed
   └─> 🔘 Four buttons:
       │
       ├─> ✅ [Accept]
       │   │
       │   ├─> Modal opens: "Enter acceptance reason"
       │   ├─> Admin types: "Welcome! Great answers."
       │   ├─> User gets DM: "You've been accepted!"
       │   ├─> 🎭 Role assigned automatically
       │   └─> Embed turns green ✅
       │
       ├─> ❌ [Deny]
       │   │
       │   ├─> Modal opens: "Enter denial reason"
       │   ├─> Admin types: "Need more experience"
       │   ├─> User gets DM: "Application denied"
       │   └─> Embed turns red ❌
       │
       ├─> 📋 [History]
       │   │
       │   ├─> Shows all past applications
       │   ├─> ✅ Staff - Accepted (Jan 15, 2024)
       │   ├─> ❌ Moderator - Denied (Jan 10, 2024)
       │   └─> ⏳ HR - Pending (Jan 8, 2024)
       │
       └─> 🎫 [Open Ticket]
           │
           ├─> Creates private channel
           ├─> Name: ticket-johndoe
           ├─> Visible to: User + Admins
           └─> Perfect for interviews!


┌─────────────────────────────────────────────────────────────────┐
│                    DATA FLOW                                     │
└─────────────────────────────────────────────────────────────────┘

config/servers/[guild_id].json
├─> Guild configuration
├─> Log channel ID
├─> Admin role IDs
├─> Ticket category ID
├─> Cooldown hours
└─> Categories:
    ├─> Name, Description
    ├─> Role ID (for auto-assignment)
    └─> Questions array

data/applications/[guild_id].json
├─> All applications for this server
└─> Each application:
    ├─> ID, User ID, Username
    ├─> Category applied for
    ├─> Answers array
    ├─> Timestamp
    ├─> Status (pending/accepted/denied)
    ├─> Reviewed by (admin ID)
    └─> Reason

data/cooldowns/[guild_id].json
├─> User ID -> Last application timestamp
└─> Prevents spam applications


┌─────────────────────────────────────────────────────────────────┐
│                 MULTI-SERVER ISOLATION                           │
└─────────────────────────────────────────────────────────────────┘

Server A (Guild 1)
├─> config/servers/123456.json
├─> data/applications/123456.json
└─> data/cooldowns/123456.json

Server B (Guild 2)
├─> config/servers/789012.json
├─> data/applications/789012.json
└─> data/cooldowns/789012.json

❌ No data shared between servers
✅ Complete isolation


┌─────────────────────────────────────────────────────────────────┐
│                    COMMAND STRUCTURE                             │
└─────────────────────────────────────────────────────────────────┘

Admin Commands:
├─> /setup             → Initial server configuration
├─> /addcategory       → Add new application type
├─> /editquestions     → Modify category questions
├─> /removecategory    → Delete application type
├─> /setlogchannel     → Change where apps are sent
├─> /setticketcategory → Set ticket channel category
├─> /setcooldown       → Adjust application cooldown
└─> /viewconfig        → View current settings

User Commands:
└─> /panel             → Deploy application panel


┌─────────────────────────────────────────────────────────────────┐
│                  PERMISSION SYSTEM                               │
└─────────────────────────────────────────────────────────────────┘

Admin Detection:
├─> Has Administrator permission? → YES → Admin
└─> Has configured admin role?    → YES → Admin
    └─> Otherwise → Regular User

Admin Actions:
├─> Accept/Deny applications
├─> View application history
├─> Open tickets
├─> Configure bot
└─> Manage categories

User Actions:
├─> View application panel
├─> Submit applications
└─> Receive DMs with results


┌─────────────────────────────────────────────────────────────────┐
│                   ERROR HANDLING                                 │
└─────────────────────────────────────────────────────────────────┘

❌ User DMs disabled
   └─> "I couldn't send you a DM. Please enable DMs..."

❌ Bot not set up
   └─> "Please run /setup first!"

❌ No admin permission
   └─> "You need administrator permissions..."

❌ Cooldown active
   └─> "You must wait X hours before applying again."

❌ Category not found
   └─> "Application category not found!"

❌ Ticket category not set
   └─> "Use /setticketcategory first!"

✅ All errors handled gracefully


┌─────────────────────────────────────────────────────────────────┐
│                    FEATURES SUMMARY                              │
└─────────────────────────────────────────────────────────────────┘

✅ Multi-server support (isolated data)
✅ Customizable application categories
✅ Multiple question types (text, yes/no)
✅ DM-based application flow
✅ Admin review dashboard
✅ Auto-role assignment on acceptance
✅ Application history tracking
✅ Private ticket creation
✅ Configurable cooldown system
✅ Slash commands (modern Discord UI)
✅ Permission-based access control
✅ Local JSON storage (no database needed)
✅ Easy category management
✅ Custom question editing
✅ Real-time DM notifications
✅ Professional embed designs
```

## Key Technical Details

**Storage Format:**
- JSON files for easy editing
- Per-server data isolation
- No database dependencies

**Interaction Types:**
- Slash Commands: Configuration and deployment
- String Select Menus: Category selection
- Buttons: Accept/Deny/History/Ticket
- Modals: Reason input, question editing
- Direct Messages: Application questions

**Discord.js Features:**
- v14 latest version
- Modern interaction system
- Ephemeral messages for privacy
- Error handling and logging

**Security:**
- Role-based permissions
- Admin-only commands
- DM privacy
- Per-server isolation

**Scalability:**
- Unlimited servers supported
- Unlimited categories per server
- Unlimited applications tracked
- No external dependencies
