import { SlashCommandBuilder } from 'discord.js';
import { createDashboard, createPreviewEmbed } from '../components/buildDashboard.js';

export const data = new SlashCommandBuilder()
  .setName('build')
  .setDescription('Interactive AI-powered server builder');

export async function execute(interaction) {
  if (interaction.user.id !== interaction.guild.ownerId)
    return interaction.reply({ content: '❌ Only server owner can run this.', ephemeral:true });

  const dashboard = createDashboard();
  await interaction.reply({ embeds:[createPreviewEmbed({})], components: dashboard.components, ephemeral:true });
}

