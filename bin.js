#!/usr/bin/env node
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import prompts from 'prompts';
import chalk from 'chalk';
import ora from 'ora';
import boxen from 'boxen';
import figlet from 'figlet';
import gradient from 'gradient-string';

// __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// List with emojis in languages
const ALL_LANGS = {
    en: '🌍 English',
    pt_br: '🌍 Portuguese (BR)',
    es: '🌍 Spanish',
    ru: '🌍 Russian',
};

console.log(
    gradient.atlas(
        figlet.textSync('Vue Arise', {
            font: 'Big',
            horizontalLayout: 'default',
            verticalLayout: 'default'
        })
    )
);

// Welcome box
console.log(
    boxen(
        chalk.bold.cyan('🌱 Welcome to vue-arise') +
        '\nCreate a professional Vue 3 + TS project in seconds!',
        {
            padding: 1,
            borderColor: 'cyan',
            margin: 1,
            align: 'center',
        }
    )
);

async function main() {
    const response = await prompts([
        {
            type: 'text',
            name: 'projectName',
            message: chalk.cyan('📦 What is the name of your project?'),
            validate: (name) => name.trim() !== '' || 'Please enter a valid name.',
        },
        {
            type: 'multiselect',
            name: 'languages',
            message: chalk.cyan('🌍 Select the languages you want to support:'),
            choices: Object.entries(ALL_LANGS).map(([value, title]) => ({
                title,
                value,
            })),
            min: 1,
            hint: '- Space to select. Return to confirm',
        },
        {
            type: 'select',
            name: 'defaultLang',
            message: chalk.cyan('🏁 Select the default language:'),
            choices: Object.entries(ALL_LANGS).map(([value, title]) => ({
                title,
                value,
            })),
        },
    ]);

    const { projectName, languages, defaultLang } = response;

    if (!projectName || languages.length === 0) {
        console.log(chalk.red('\n❌ Project creation cancelled.\n'));
        process.exit(1);
    }

    const templateDir = path.join(__dirname, 'template');
    const targetDir = path.join(process.cwd(), projectName);

    if (fs.existsSync(targetDir)) {
        console.log(
            chalk.yellow(
                `\n⚠️  Folder "${projectName}" already exists. Please choose another name.\n`
            )
        );
        process.exit(1);
    }

    const spinner = ora('📁 Creating project structure...').start();

    try {
        fs.copySync(templateDir, targetDir);

        const localesDir = path.join(targetDir, 'src', 'locales');
        const allLocaleFiles = fs.readdirSync(localesDir);
        allLocaleFiles.forEach((file) => {
            const lang = file.replace('.json', '');
            if (!languages.includes(lang)) {
                fs.removeSync(path.join(localesDir, file));
            }
        });

        const i18nCode = generateI18nTs(languages, defaultLang);
        fs.writeFileSync(
            path.join(targetDir, 'src', 'i18n.ts'),
            i18nCode,
            'utf-8'
        );

        spinner.succeed(chalk.green('✅ Project structure created successfully!'));

        console.log(
            boxen(chalk.greenBright(`🎉 Project "${projectName}" is ready!`), {
                padding: 1,
                borderColor: 'green',
                align: 'center',
            })
        );

        console.log(`\n👉 ${chalk.cyan('Next steps:')}`);
        console.log(chalk.gray(`   $ cd ${projectName}`));
        console.log(chalk.gray('   $ npm install'));
        console.log(chalk.gray('   $ npm run dev\n'));
    } catch (error) {
        spinner.fail(chalk.red('❌ Failed to create the project.'));
        console.error(error);
    }
}

function generateI18nTs(langs, defaultLang) {
    const imports = langs
        .map((lang) => `import ${lang} from '@/locales/${lang}.json'`)
        .join('\n');
    const messages = `const messages = {\n  ${langs.join(',\n  ')}\n}`;

    return `
import { createI18n } from 'vue-i18n'
${imports}

${messages}

export const i18n = createI18n({
  legacy: false,
  locale: '${defaultLang}',
  fallbackLocale: 'en',
  messages,
  globalInjection: true
})

export default i18n
  `.trim();
}

main();
