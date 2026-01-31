import { SlashCommandBuilder } from 'discord.js';
import { createDashboard, createPreviewEmbed } from '../components/buildDashboard.js';

export const data = new SlashCommandBuilder()
  .setName('build')
  .setDescription('Interactive AI-powered server builder');

export async function execute(interaction) {
  if (interaction.user.id !== interaction.guild.ownerId) {
    return interaction.reply({ content: '❌ Only server owner can run this.', ephemeral: true });
  }

  // Let Discord know we're working on it
  await interaction.deferReply({ ephemeral: true });

  // Create the dashboard
  const dashboard = createDashboard();
  await interaction.editReply({
    embeds: [createPreviewEmbed({})],
    components: dashboard.components
  });
}
