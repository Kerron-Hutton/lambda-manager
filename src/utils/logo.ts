import * as figlet from 'figlet';
import * as chalk from 'chalk';

/**
 * Displays the branding logo on the screen.
 */
export function displayLogo() {
    console.clear();
    console.log(
        chalk.default.blueBright(
            figlet.textSync('Lambda Manager', { horizontalLayout: 'default' })
        )
    );
}
