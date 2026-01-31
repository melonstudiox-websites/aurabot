import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// A simple route
app.get('/', (req, res) => {
  res.send('AuraBot is running!');
});

// Start listening
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

import 'dotenv/config';
import { Client, GatewayIntentBits, REST, Routes, Collection, InteractionType, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { generateRoleName, generateRoleColor } from './utils/roleGenerator.js';
import { generateServerJSON } from './utils/chatGPT.js';
import { createPreviewEmbed } from './components/buildDashboard.js';

const client = new Client({ intents:[GatewayIntentBits.Guilds] });
client.commands = new Collection();
const tempSelections = {}; 

// Load commands
const commandFiles = fs.readdirSync('./commands').filter(f=>f.endsWith('.js'));
for (const file of commandFiles) {
  const { data, execute } = await import(`./commands/${file}`);
  client.commands.set(data.name,{data,execute});
}

// Deploy commands
const rest = new REST({version:'10'}).setToken(process.env.TOKEN);
await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: Array.from(client.commands.values()).map(c=>c.data.toJSON()) });

client.once('ready',()=>console.log(`✅ Logged in as ${client.user.tag}`));

// Dashboard interactions
client.on('interactionCreate', async interaction => {
  const userId = interaction.user.id;

  if (interaction.isChatInputCommand()) {
    const cmd = client.commands.get(interaction.commandName);
    if (!cmd) return;
    await cmd.execute(interaction);
  }

  // Dropdowns
  else if (interaction.isStringSelectMenu()) {
    if (!tempSelections[userId]) tempSelections[userId] = {};
    const val = interaction.values[0];

    if (interaction.customId.startsWith('select_')) {
      const key = interaction.customId.replace('select_','');
      if (key==='ai') tempSelections[userId].aiGenerate = val==='yes';
      else if (key==='wrapper') tempSelections[userId].wrapper = JSON.parse(val);
      else if (key==='feature') tempSelections[userId].features = interaction.values;
      else tempSelections[userId][key] = val;

      await interaction.update({ embeds:[createPreviewEmbed(tempSelections[userId])], components:interaction.message.components });
    }
  }

  // Buttons
  else if (interaction.isButton()) {
    if (!tempSelections[userId]) return;

    if (interaction.customId==='prompt_extra') {
      const modal = new ModalBuilder().setCustomId('extraPromptModal').setTitle('Extra Prompt');
      const input = new TextInputBuilder().setCustomId('extraPromptInput').setLabel('Extra Instructions').setStyle(TextInputStyle.Paragraph).setPlaceholder('Add any instructions for ChatGPT').setRequired(false);
      modal.addComponents(new ActionRowBuilder().addComponents(input));
      await interaction.showModal(modal);
    }
    else if (interaction.customId==='cancel_build') {
      delete tempSelections[userId];
      await interaction.update({ content:'❌ Build canceled', components:[], embeds:[] });
    }
    else if (interaction.customId==='confirm_build') {
      await interaction.update({ content:'⚙️ Building server...', components:[], embeds:[] });

      let serverJSON;
      if (tempSelections[userId].aiGenerate) {
        const prompt = `
        You are a Discord server AI designer.
        Use these selections: ${JSON.stringify(tempSelections[userId])}
        Create roles, channels, categories, bot invites.
        Include for roles: name, emoji, font, wrapper, color hex, permissions
        Include for channels: name, type, category, permissions
        Include bots: name and invite link
        Return ONLY JSON.
        `;
        serverJSON = await generateServerJSON(prompt);
      } else {
        // Local fallback (simplified)
        const roles = ['owner','admin','mod','vip','member','muted'].map(tier=>({
          tier,
          name: generateRoleName(tier,tempSelections[userId]),
          color: generateRoleColor(tier),
          permissions: tier==='admin'?['Administrator']:[]
        }));
        serverJSON = {roles,channels:[],bots:[]};
      }

      if (!serverJSON) return interaction.followUp({ content:'❌ Failed to generate JSON from AI.' });

      // Create roles
      for (const role of serverJSON.roles) {
        await interaction.guild.roles.create({
          name: role.name,
          color: parseInt(role.color.toString().replace("#","0x")),
          permissions: role.permissions || [],
          reason:'Aura Builder AI'
        });
      }

      // Create categories & channels
      const categories = {};
      for (const ch of serverJSON.channels) {
        if (ch.category && !categories[ch.category]) {
          const cat = await interaction.guild.channels.create({ name:ch.category,type:4 });
          categories[ch.category] = cat.id;
        }
        await interaction.guild.channels.create({
          name: ch.name,
          type: ch.type==='voice'?2:0,
          parent: ch.category?categories[ch.category]:null,
          permissionOverwrites: ch.permissions?Object.entries(ch.permissions).map(([k,v])=>({id:k,allow:v==='ALLOW'?0x1:0})):[]
        });
      }

      // Send bot invites
      if (serverJSON.bots?.length>0) {
        const botMsg = serverJSON.bots.map(b=>`🤖 ${b.name}: ${b.invite}`).join('\n');
        await interaction.followUp({ content:`✨ Server setup complete!\n${botMsg}` });
      } else await interaction.followUp({ content:'✨ Server setup complete!' });

      delete tempSelections[userId];
    }
  }

  // Extra Prompt Modal
  else if (interaction.type===InteractionType.ModalSubmit && interaction.customId==='extraPromptModal') {
    tempSelections[userId].extraPrompt = interaction.fields.getTextInputValue('extraPromptInput');
    await interaction.reply({ content:'📝 Extra prompt saved!', ephemeral:true });
  }
});

client.login(process.env.TOKEN);

