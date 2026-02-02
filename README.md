# Minecraft Server Status Dashboard

A Next.js-based status dashboard for displaying Minecraft servers managed by Pelican Panel. Features real-time status updates, metadata-based filtering, and a modern, responsive UI.

![Dashboard Preview](/.gemini/antigravity/brain/d0398eba-097f-4da8-adf6-481eee20d8af/dashboard_initial_load_1769997110529.webp)

## Features

- ✨ **Real-time Status** - Live online/offline status for each server
- 🎯 **Smart Filtering** - Show/hide servers using metadata tags
- 📁 **Server Grouping** - Organize servers by categories
- 🚀 **Power Control** - Start offline servers with one click
- 🌐 **Connection Info** - Display main and direct connection addresses
- 🎨 **Modern UI** - Beautiful dark mode with smooth animations
- 🔄 **Auto-refresh** - Updates every 30 seconds
- 📱 **Responsive** - Works on desktop, tablet, and mobile

## Prerequisites

- **Node.js** 18.x or higher
- **Pelican Panel** with admin access
- **API Keys**:
  - Application API key (for fetching server list)
  - Client API key (for fetching real-time status)

## Installation

1. **Clone or download the project**
   ```bash
   cd ericmcstatus
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the project root:
   ```env
   PELICAN_PANEL_URL=https://pelican.example.com
   PELICAN_API_KEY=papp_your_application_api_key_here
   PELICAN_CLIENT_API_KEY=ptlc_your_client_api_key_here
   ```

   **Getting your API keys:**
   - **Application API Key**: Pelican Panel → Admin → Application API
   - **Client API Key**: Pelican Panel → Account Settings → API Credentials
     - Create a key for a user account that has access to all servers you want to display

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3001](http://localhost:3001)

## Server Configuration

To display servers on the dashboard, you need to configure each server's `external_id` field in Pelican Panel.

### Setting the External ID

1. Go to Pelican Panel → Servers → [Your Server] → Settings
2. Set the **External ID** field using key:value pairs separated by commas

### External ID Format

```
display:true,domain:er-ic.ca,subdomain:survival.er-ic.ca
```

### Available Metadata Keys

| Key | Required | Description | Example |
|-----|----------|-------------|---------|
| `display` | ✅ Yes | Must be `"true"` to show server | `display:true` |
| `domain` | ❌ No | Main shared connection address | `domain:er-ic.ca` |
| `subdomain` | ❌ No | Direct server-specific address | `subdomain:atm10sky.er-ic.ca` |
| `group` | ❌ No | Category to organize servers under | `group:Modpacks` |
| `subgroup` | ❌ No | Subcategory (for future use) | `subgroup:ATM` |

### Example Configurations

**Basic server (show with no connection info):**
```
display:true
```

**Server with main domain:**
```
display:true,domain:play.example.com
```

**Server with both domains:**
```
display:true,domain:play.example.com,subdomain:survival.play.example.com
```

**Server with grouping:**
```
display:true,domain:play.example.com,group:Modpacks,subgroup:ATM
```

**Complete example:**
```
display:true,domain:er-ic.ca,subdomain:atm10sky.er-ic.ca,group:Modpacks,subgroup:ATM10
```

**Hidden server (don't display):****
```
display:false
```
Or leave `external_id` empty.

## How It Works

1. **Fetches server list** from Pelican Application API (`/api/application/servers`)
2. **Parses metadata** from each server's `external_id` field
3. **Filters servers** to only show those with `display:true`
4. **Fetches real-time status** for each displayed server from `/api/client/servers/{uuid}/resources`
5. **Displays servers** in a responsive grid with status badges and connection info
6. **Auto-refreshes** every 30 seconds

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard:
   - `PELICAN_PANEL_URL`
   - `PELICAN_API_KEY`
   - `PELICAN_CLIENT_API_KEY`
4. Deploy!

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables for Production

Make sure to set these in your deployment platform:
- `PELICAN_PANEL_URL` - Your Pelican Panel URL (e.g., `https://pelican.example.com`)
- `PELICAN_API_KEY` - Application API key from Pelican
- `PELICAN_CLIENT_API_KEY` - Client API key from Pelican

## Customization

### Change Port

Edit `package.json`:
```json
{
  "scripts": {
    "dev": "next dev -p 3001"
  }
}
```

### Modify Auto-refresh Interval

Edit `app/page.tsx` line 45:
```typescript
}, 30000); // Change 30000 (30 seconds) to your preferred interval
```

### Update Color Scheme

Edit `app/globals.css` to customize colors, fonts, and styling.

## Troubleshooting

### "Failed to fetch servers" Error

- Check that `PELICAN_PANEL_URL` is correct (no trailing slash)
- Verify your Application API key is valid
- Ensure your Pelican Panel is accessible from where you're running the app

### Status Shows "Unknown"

- Verify `PELICAN_CLIENT_API_KEY` is set correctly
- Ensure the client API key belongs to a user with access to the servers
- Check that the API key has the necessary permissions

### Servers Not Appearing

- Verify the server's `external_id` contains `display:true`
- Check for typos in the external_id format (no spaces around colons/commas)
- Look at the terminal logs to see which servers are being filtered

### Connection Addresses Not Showing

- Ensure you've added `domain` and/or `subdomain` to the server's `external_id`
- Format: `display:true,domain:example.com,subdomain:server.example.com`

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Pelican Panel API** - Server data

## License

This project is provided as-is for use with Pelican Panel.

## Support

For issues related to:
- **This dashboard**: Check the troubleshooting section above
- **Pelican Panel**: Visit [Pelican Documentation](https://pelican.dev)
- **API questions**: Refer to Pelican Panel API docs

---

**Note**: Make sure your Pelican Panel and API keys are kept secure. Never commit `.env.local` to version control.
