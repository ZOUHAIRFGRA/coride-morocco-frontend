# CoRide Morocco Frontend

## Project Overview
**CoRide Morocco** is a mobile app for non-professional carpooling in Morocco, connecting commuters (e.g., students to Uni X, workers to Place X) for cost-sharing rides paid in cash, inspired by inDrive’s model. It tackles expensive taxis and unreliable buses with a unique “Trajectory Tribes” feature—hyper-local communities for sharing rides, traffic tips, and chats. Built with **React Native (Expo Go)**, this frontend delivers a bilingual (Arabic/French), Morocco-centric UX integrated with a FastAPI backend.

This side project enhances my portfolio ([GitHub](https://github.com/ZOUHAIRFGRA)), building on my React Native experience (e.g., KessabPro, uni-nest-mobile) to showcase mobile development and localized UX design. It uses cash payments to stay non-commercial, aligning with Morocco’s regulations and user preferences.

## Features
- **Route Input & Matching**: Enter trajectories (e.g., home to Uni X) for AI-driven ride matches.
- **Trajectory Tribes**: Join/create communities for chats and ride coordination.
- **Cash Payments**: In-app negotiation of cost-sharing (e.g., fuel costs), paid in cash, with amounts logged for transparency.
- **Bilingual UI**: Arabic/French support with Morocco-inspired design (e.g., zellige patterns).
- **Real-Time Updates**: Live tribe chats and ride status via WebSockets.
- **Safety Features**: User profiles, ratings, and emergency button.

## Tech Stack
- **Framework**: React Native with Expo Go for cross-platform mobile.
- **State Management**: Redux Toolkit for app state.
- **Styling**: NativeWind (Tailwind CSS for React Native).
- **Real-Time**: Pusher or WebSocket client for live updates.
- **APIs**: Axios for REST calls to FastAPI backend.
- **Maps**: Google Maps SDK or OpenStreetMap for route visualization.
- **Testing**: Jest and React Native Testing Library.
- **Build/Deploy**: Expo EAS for APKs and app store distribution.

## Setup Instructions
1. **Clone**: `git clone https://github.com/ZOUHAIRFGRA/coride-morocco-frontend.git`
2. **Install Dependencies**: `npm install`
3. **Configure Environment**: Copy `.env.example` to `.env` and set `API_URL`, `GOOGLE_MAPS_API_KEY`, `PUSHER_KEY`.
4. **Run App**: `expo start` (scan QR code with Expo Go or use emulator: `a` for Android, `i` for iOS).
5. **Access**: App runs at `http://localhost:19000`.

## Contribution Guidelines
- **Collaborators**: Fork the repo, use `feature/your-feature` branches, and submit PRs with tests. Needed: UI designers for Arabic RTL, testers for low-data networks.
- **Issues**: See [Issues](https://github.com/ZOUHAIRFGRA/coride-morocco-frontend/issues) for tasks (e.g., CO2 tracker UI, map optimizations).
- **Code Style**: ESLint with Prettier; follow React Native best practices.

## Roadmap
- Implement CO2 savings dashboard.
- Add Arabic RTL for full bilingual UX.
- Optimize map rendering for low-data networks.
- Enhance cash payment UI (e.g., QR code receipts).
- Publish to Google Play/App Store via Expo EAS.

## Why This Project?
This frontend builds on my React Native expertise, showcasing:
- Cross-platform mobile development with Expo Go.
- Localized UX for Morocco’s commuters, including cash-based payments.
- Real-time UI integration with WebSockets.
- Modern tooling for scalable apps.

For collaborators, it’s an opportunity to shape a user-focused app for Morocco’s mobility needs. For recruiters, it demonstrates my ability to deliver polished mobile experiences.


## Contact
- GitHub: [ZOUHAIRFGRA](https://github.com/ZOUHAIRFGRA)
- Email: [zouhairfgra@gmail.com](mailto:zouhairfgra@gmail.com)
- Issues: Report bugs or suggest features in the repo.