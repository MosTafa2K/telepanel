import os
from pyrogram import Client, filters
from pyrogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)

# Bot configuration
API_ID = int(os.getenv("API_ID"))
API_HASH = os.getenv("API_HASH")
BOT_TOKEN = os.getenv("BOT_TOKEN")
WEBAPP_URL = os.getenv("WEBAPP_URL", "https://your-domain.com")  # Your web app URL

# Initialize the bot
app = Client(
    "telegram_miniapp_bot", api_id=API_ID, api_hash=API_HASH, bot_token=BOT_TOKEN
)


@app.on_message(filters.command("start"))
async def start_command(client, message):
    """Handle /start command"""
    keyboard = InlineKeyboardMarkup(
        [
            [
                InlineKeyboardButton(
                    "🚀 Open Profile Mini App",
                    web_app=WebAppInfo(url=f"{WEBAPP_URL}/webapp/index.html"),
                )
            ],
            [InlineKeyboardButton("ℹ️ Help", callback_data="help")],
        ]
    )

    await message.reply_text(
        "**Welcome to Profile Mini App!** 🎉\n\n"
        "Click the button below to open the profile mini app and view your Telegram profile information.\n\n"
        "The app will show you:\n"
        "• Your profile picture\n"
        "• First name and last name\n"
        "• Username\n"
        "• Telegram ID\n"
        "• Language code\n"
        "• Premium status",
        reply_markup=keyboard,
        parse_mode="Markdown",
    )


@app.on_callback_query(filters.regex("help"))
async def help_callback(client, callback_query):
    """Handle help callback"""
    await callback_query.answer()
    await callback_query.message.reply_text(
        "**How to use:**\n\n"
        "1. Click the 'Open Profile Mini App' button\n"
        "2. Allow the app to access your Telegram data\n"
        "3. View your complete profile information\n\n"
        "The mini app uses Telegram Web App API to securely access your profile data.\n"
        "No data is stored on our servers - it's displayed locally in your browser.",
        parse_mode="Markdown",
    )


@app.on_message(filters.command("profile"))
async def profile_command(client, message):
    """Send profile information as a message (alternative to mini app)"""
    user = message.from_user

    # Get profile photo
    profile_photos = await client.get_chat_photos(user.id)
    has_photo = profile_photos.total_count > 0

    profile_text = (
        f"**📱 Your Telegram Profile**\n\n"
        f"**ID:** `{user.id}`\n"
        f"**First Name:** {user.first_name or 'N/A'}\n"
        f"**Last Name:** {user.last_name or 'N/A'}\n"
        f"**Username:** @{user.username if user.username else 'Not set'}\n"
        f"**Language:** {user.language_code or 'N/A'}\n"
        f"**Premium:** {'✅ Yes' if user.is_premium else '❌ No'}\n"
        f"**Profile Photo:** {'✅ Has photo' if has_photo else '❌ No photo'}\n"
        f"**DC ID:** {user.dc_id or 'N/A'}"
    )

    if has_photo:
        # Get the largest photo (index 0 is the newest/biggest)
        photo = await client.download_media(profile_photos[0].file_id)
        await message.reply_photo(photo, caption=profile_text, parse_mode="Markdown")
        os.remove(photo)  # Clean up
    else:
        await message.reply_text(profile_text, parse_mode="Markdown")


@app.on_message(filters.command("help"))
async def help_command(client, message):
    """Handle /help command"""
    await message.reply_text(
        "**Available Commands:**\n\n"
        "• `/start` - Open the mini app\n"
        "• `/profile` - View profile directly in chat\n"
        "• `/help` - Show this help message\n\n"
        "**About:**\n"
        "This bot demonstrates a Telegram Mini App that displays user profile information.",
        parse_mode="Markdown",
    )


@app.on_message(filters.private & ~filters.command(["start", "profile", "help"]))
async def echo(client, message):
    """Handle other messages"""
    await message.reply_text(
        "Please use the buttons or commands:\n"
        "• /start - Open Mini App\n"
        "• /profile - View profile\n"
        "• /help - Get help"
    )


if __name__ == "__main__":
    print("🤖 Bot is starting...")
    app.run()
