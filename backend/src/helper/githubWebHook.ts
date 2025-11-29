import { Octokit } from '@octokit/rest';
import { prisma } from '../prisma'



export const setupWebhookForUser = async (
    userId: number,
    accessToken: string,
    webhookUrl: string
) => {
    try {
        const octokit = new Octokit({ auth: accessToken });

        const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
            per_page: 100,
            affiliation: 'owner'
        });

        console.log(`Setting up webhooks for ${repos.length} repositories...`);

        for (const repo of repos) {
            try {
                const { data: hooks } = await octokit.rest.repos.listWebhooks({
                    owner: repo.owner.login,
                    repo: repo.name
                });

                const existingHook = hooks.find(hook =>
                    hook.config.url === webhookUrl
                );

                if (existingHook) {
                    console.log(`Webhook already exists for ${repo.name}`);
                    continue;
                }

                await octokit.rest.repos.createWebhook({
                    owner: repo.owner.login,
                    repo: repo.name,
                    config: {
                        url: webhookUrl,
                        content_type: 'json',
                        secret: process.env.GITHUB_WEBHOOK_SECRET!,
                        insecure_ssl: '0'
                    },
                    events: ['push'],
                    active: true
                });

                console.log(`✅ Webhook created for ${repo.name}`);

            } catch (error) {
                console.error(`Failed to setup webhook for ${repo.name}:`, error);
            }
        }

        await prisma.user.update({
            where: { id: userId },
            data: { githubWebHookConfig: true }
        });

        return { success: true, reposConfigured: repos.length };

    } catch (error) {
        console.error('Error setting up webhooks:', error);
        throw error;
    }
}