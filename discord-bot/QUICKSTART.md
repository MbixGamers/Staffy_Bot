# Quick Start Guide 🚀

## For Server Owners

### Initial Setup (5 minutes)

1. **Invite the bot to your server**
   - The bot is already running!
   - Make sure it has Administrator permission (or Manage Channels + Manage Roles + Send Messages)

2. **Run the setup command**
   ```
   /setup log_channel:#applications admin_role:@Admin
   ```
   - `log_channel`: Where applications will be sent
   - `admin_role`: Role that can review applications

3. **Deploy the application panel**
   ```
   /panel
   ```
   - This creates the panel that users will interact with
   - Panel will show in the current channel
   - Users click dropdown → Bot DMs them questions

4. **Done!** Your application system is ready! 🎉

---

## For Admins

### Common Tasks

**Add a new application type:**
```
/addcategory name:Moderator description:"Apply for Moderator" role:@Moderator
```

**Edit questions:**
```
/editquestions category:Staff
```

**Change settings:**
```
/setlogchannel channel:#new-log-channel
/setcooldown hours:48
/setticketcategory category:[Tickets Category]
```

**View current config:**
```
/viewconfig
```

**Remove a category:**
```
/removecategory category:Moderator
```

---

## For Users

### How to Apply

1. Go to the applications channel
2. Find the application panel
3. Click the dropdown menu
4. Select the role you want to apply for
5. Check your DMs!
6. Answer each question
7. Submit and wait for review

**Notes:**
- You can type `cancel` at any time to stop
- Make sure your DMs are enabled
- You can only apply once every 24 hours (default)

---

## Admin Review Process

When an application arrives:

1. **✅ Accept** - Opens a modal to write acceptance reason
   - User gets DM with your message
   - User automatically receives the role (if configured)

2. **❌ Deny** - Opens a modal to write denial reason
   - User gets DM with your message

3. **📋 History** - View all past applications from this user
   - See if they've applied before
   - See previous outcomes

4. **🎫 Open Ticket** - Create a private channel
   - Discuss the application in depth
   - Perfect for interviews

---

## File Locations

```
/app/discord-bot/
├── config/servers/          # Server configs (auto-created)
├── data/applications/       # All applications (auto-created)
├── data/cooldowns/         # Cooldown tracking (auto-created)
├── index.js                # Main bot code
├── init.js                 # Command registration
└── .env                    # Bot credentials
```

---

## Troubleshooting

**Bot not responding?**
- Wait 5-10 minutes for commands to sync
- Check bot is online
- Try running: `cd /app/discord-bot && node init.js`

**Users can't receive DMs?**
- They need to enable: Server → Privacy Settings → "Allow direct messages from server members"

**Role not assigned?**
- Bot's role must be higher than the role being assigned
- Check bot has "Manage Roles" permission

**Ticket creation fails?**
- Run `/setticketcategory` first
- Bot needs "Manage Channels" permission

---

## Need Help?

Check the full README.md for detailed documentation!

**Bot Status:**
```bash
cd /app/discord-bot
ps aux | grep "node index.js"
tail -f bot.log
```

---

**Made with ❤️ using discord.js v14**
