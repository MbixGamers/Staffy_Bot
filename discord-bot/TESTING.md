# Discord Bot Testing Guide 🧪

## Pre-Testing Checklist

✅ Bot is running (check with `ps aux | grep "node index.js"`)
✅ Bot is online in your Discord server
✅ Bot has Administrator permissions (or Manage Channels, Manage Roles, Send Messages)
✅ Commands are registered (you should see them when typing `/`)

## Step-by-Step Testing

### 1. Initial Setup

**Test `/setup` command:**
```
/setup log_channel:#applications admin_role:@Staff
```

**Expected Result:**
- ✅ Bot creates a config file in `/config/servers/{your_guild_id}.json`
- ✅ You receive a success message
- ✅ Default "Staff" category is created

**Verify:**
```bash
cd /app/discord-bot
ls -la config/servers/
```

---

### 2. View Configuration

**Test `/viewconfig` command:**
```
/viewconfig
```

**Expected Result:**
- ✅ Shows current server configuration
- ✅ Displays log channel, cooldown (24h), admin roles
- ✅ Lists categories (should show "Staff" by default)

---

### 3. Add Additional Categories

**Test `/addcategory` command:**
```
/addcategory name:Moderator description:"Apply for Moderator position" role:@Moderator
```

**Expected Result:**
- ✅ Category is added
- ✅ Success message with instructions to edit questions
- ✅ Can view it in `/viewconfig`

**Add another category:**
```
/addcategory name:HR description:"Human Resources team application"
```

---

### 4. Set Ticket Category (Optional)

**First, create a category in Discord:**
- Right-click server → Create Category → Name it "Tickets"

**Then run:**
```
/setticketcategory category:[Select Tickets category]
```

**Expected Result:**
- ✅ Ticket category is set
- ✅ Future tickets will be created under this category

---

### 5. Deploy the Application Panel

**Test `/panel` command:**
```
/panel
```
or
```
/panel channel:#applications
```

**Expected Result:**
- ✅ Bot sends an embed with all available categories
- ✅ Dropdown menu appears below the embed
- ✅ Dropdown shows all your categories (Staff, Moderator, HR, etc.)

**Visual Check:**
- Title: "📋 Application Panel"
- Description lists all positions
- Dropdown says "Choose an application type..."

---

### 6. Submit an Application (User Flow)

**Test the application process:**

1. Click the dropdown in the application panel
2. Select "Staff" (or any category)
3. Bot should DM you instantly

**Expected DM Content:**
- Title: "📝 Staff Application"
- Description explains the process
- Shows number of questions
- Instructions to type answers or type `cancel`

**Answer the questions:**
- For text questions: Type your answer
- For yes/no questions: Click Yes or No buttons

**Expected Behavior:**
- ✅ Bot asks questions one by one
- ✅ After last answer, bot says "Application Submitted!"
- ✅ Application appears in the log channel

---

### 7. Admin Review Process

**In the log channel, you should see:**
- 📋 Embed with applicant info
- All answers displayed
- 4 buttons: Accept, Deny, History, Open Ticket

**Test Accept Button:**
1. Click "✅ Accept"
2. Modal appears asking for a reason
3. Type: "Welcome to the team! Great answers."
4. Submit

**Expected Result:**
- ✅ Embed updates to green color
- ✅ Shows status: "✅ Accepted"
- ✅ Shows reviewer name
- ✅ Shows reason
- ✅ Buttons are removed
- ✅ User receives a DM with acceptance message
- ✅ User gets the role (if roleId was set)

**Test Deny Button:**
1. Have another user apply
2. Click "❌ Deny"
3. Type reason: "Need more experience"
4. Submit

**Expected Result:**
- ✅ Embed turns red
- ✅ Status: "❌ Denied"
- ✅ User gets DM with denial message

**Test History Button:**
1. Click "📋 History" on any application
2. See all past applications from that user

**Expected Result:**
- ✅ Shows all applications (even from other categories)
- ✅ Shows status (accepted/denied/pending)
- ✅ Shows timestamps

**Test Open Ticket Button:**
1. Click "🎫 Open Ticket"
2. Bot creates a private channel

**Expected Result:**
- ✅ New channel created: `ticket-username`
- ✅ Channel is under the Tickets category (if set)
- ✅ Only visible to: applicant, admins, and bot
- ✅ Contains a welcome message

---

### 8. Cooldown System

**Test application cooldown:**

1. Have a user submit an application
2. Immediately try to submit another one
3. Select from dropdown

**Expected Result:**
- ✅ Bot says: "⏰ You must wait X more hour(s) before submitting another application."

**Verify cooldown data:**
```bash
cd /app/discord-bot
cat data/cooldowns/{guild_id}.json
```

---

### 9. Edit Questions

**Test `/editquestions` command:**
```
/editquestions category:Staff
```

**Expected Result:**
- ✅ Modal appears with first 5 questions
- ✅ Questions are pre-filled
- ✅ You can modify them
- ✅ After submit, questions are updated

**Verify:**
- Submit a new application and see the new questions

---

### 10. Additional Admin Commands

**Test `/setlogchannel`:**
```
/setlogchannel channel:#new-applications
```
✅ Log channel is updated

**Test `/setcooldown`:**
```
/setcooldown hours:48
```
✅ Cooldown is now 48 hours

```
/setcooldown hours:0
```
✅ Cooldown is disabled (users can apply multiple times)

**Test `/removecategory`:**
```
/removecategory category:HR
```
✅ HR category is removed
✅ No longer appears in `/viewconfig` or panel dropdown

---

### 11. Multi-Server Testing

**Test multi-server isolation:**

1. Invite bot to a second server
2. Run `/setup` on Server 2
3. Add different categories on Server 2
4. Deploy panel on Server 2

**Expected Result:**
- ✅ Each server has separate config files
- ✅ Each server has separate application data
- ✅ Applications from Server 1 don't appear in Server 2
- ✅ Cooldowns are per-server

**Verify file structure:**
```bash
cd /app/discord-bot
ls -la config/servers/     # Should see multiple files
ls -la data/applications/  # Should see multiple files
ls -la data/cooldowns/     # Should see multiple files
```

---

### 12. Error Handling Tests

**Test DM disabled:**
1. Have a user disable DMs from server members
2. User tries to apply
3. Bot should say: "❌ I couldn't send you a DM. Please enable DMs..."

**Test cancel application:**
1. Start an application
2. Type `cancel` in DMs
3. Application should stop

**Test without setup:**
1. Fresh server
2. Try `/panel` before `/setup`
3. Should get: "❌ Please run `/setup` first!"

**Test non-admin using admin commands:**
1. Have a regular user try `/addcategory`
2. Should get: "❌ You need administrator permissions..."

---

## Data Verification

**Check all JSON files are created properly:**

```bash
cd /app/discord-bot

# View server config
cat config/servers/*.json | jq '.'

# View applications
cat data/applications/*.json | jq '.'

# View cooldowns
cat data/cooldowns/*.json | jq '.'
```

---

## Common Issues & Solutions

### Bot not responding to commands
**Solution:** Wait 5-10 minutes for Discord to sync global commands, or restart bot

### Can't DM users
**Solution:** User must enable "Allow direct messages from server members" in Privacy Settings

### Ticket creation fails
**Solution:** 
- Ensure bot has "Manage Channels" permission
- Run `/setticketcategory` first
- Bot's role must be higher than roles it manages

### Role not assigned on acceptance
**Solution:**
- Bot's role must be higher than the role being assigned
- Ensure "Manage Roles" permission is enabled
- roleId must be set in category config

### Commands not appearing
**Solution:**
```bash
cd /app/discord-bot
node init.js
```
Wait a few minutes

---

## Performance Testing

**Test with multiple concurrent applications:**
1. Have 3-5 users apply simultaneously
2. All should receive DMs
3. All applications should be tracked separately
4. No data corruption

**Test long answers:**
1. Answer a question with 1000+ characters
2. Should be saved correctly
3. Should display in log channel embed (may be truncated)

---

## Success Criteria

✅ All commands work without errors
✅ Applications are saved to JSON files
✅ Users receive DMs at correct times
✅ Admin review buttons work
✅ Role assignment works (if configured)
✅ Ticket creation works
✅ Cooldown prevents spam
✅ Multi-server data is isolated
✅ History shows all past applications
✅ Questions can be edited
✅ Categories can be added/removed
✅ Bot handles errors gracefully

---

## Automated Test Script

```bash
#!/bin/bash
cd /app/discord-bot

echo "Testing bot status..."
if ps aux | grep "node index.js" | grep -v grep > /dev/null; then
    echo "✅ Bot is running"
else
    echo "❌ Bot is not running"
    exit 1
fi

echo "Testing data directories..."
if [ -d "config/servers" ] && [ -d "data/applications" ] && [ -d "data/cooldowns" ]; then
    echo "✅ Data directories exist"
else
    echo "❌ Data directories missing"
    exit 1
fi

echo "Testing package installation..."
if [ -f "node_modules/discord.js/package.json" ]; then
    echo "✅ Dependencies installed"
else
    echo "❌ Dependencies missing"
    exit 1
fi

echo "All automated tests passed! ✅"
```

Save as `test.sh` and run: `bash test.sh`

---

## Manual Checklist

- [ ] Bot comes online
- [ ] `/setup` creates config
- [ ] `/panel` deploys correctly
- [ ] Users can apply via DM
- [ ] All question types work (text, yes_no)
- [ ] Applications appear in log channel
- [ ] Accept button works + DMs user
- [ ] Deny button works + DMs user
- [ ] History shows past apps
- [ ] Ticket creation works
- [ ] Cooldown prevents spam
- [ ] Role auto-assignment works
- [ ] Multi-server isolation works
- [ ] Questions can be edited
- [ ] Categories can be added/removed
- [ ] Non-admins can't use admin commands
- [ ] Bot handles missing permissions gracefully

---

**Happy Testing! 🎉**
