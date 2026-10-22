# TasteSync PRD v3: A Letterboxd for Food, Built With Friends

Oct 18, 2026 · @Karthik Bhusarapu

**Changes in v3.1 (Oct 21, 2026):** native iOS and Android apps built with Expo, plus a TypeScript API (replaces the PWA and FastAPI). Comparisons run on the phone and are sent with the visit. Schema fixes: `comparisons.visit_id`, account deletion no longer blocked by foreign keys, Firebase sign-in, HMAC phone hashes, and new `jobs`, `blocks`, `push_tokens` and `events` tables. Rules added for ranking audience and hosted weight, the MVP friends' score, and duplicate rankings on place merge.

**Changes in v3.2 (Oct 21, 2026):** new "Discover and location" section. Discover is a location-scoped home screen with Letterboxd-style shelves, friends first. Location works like Swiggy and Zomato (a location bar, saved places and an Eat out / Order in switch), but saved places stay on the phone and locations are never stored. Data-driven shelves (Hottest right now, Cheap and best, Highest rated, Hidden gems) have fixed rules and turn on per area once 8 places qualify. Schema: area centres, place price bands and delivery flags, and shelf inputs in place\_scores. App tabs: Discover, Feed, Log, Circles, You.

## Executive summary

TasteSync is a food diary you keep with your friends: log every place you eat at or order from, rank it against places you already know, and see where your circle has been and loved. It borrows Letterboxd's diary, lists and profiles, and Beli's head-to-head ranking and taste matching, then adds a private shared space built for the way Indian friend groups decide where to eat: over WhatsApp.

The wedge is one city and real friend groups. Launch in Hyderabad with about 10 friend groups (roughly 100 people) who already eat out together, prove they keep logging for a month, then open up area by area.

**The promise to a user:** "Know what you actually loved, remember where you went, and settle where to eat tonight with people whose taste you trust."

**What is in v1:** logging and ranking for both dine-in and delivery, a personal diary, lists and want-to-try, following friends, circles, and share cards for WhatsApp and Instagram.

**What is deliberately out for now:** creator tools, delivery-app links, perks, ads and any paid ranking. They are listed under parked ideas so they are not lost, but none of them is built until friends keep logging without being pushed.

## Product vision

TasteSync takes the habit loop from Letterboxd and the scoring engine from Beli, and makes the friend group, not the public crowd, the main audience.

Letterboxd turned logging films into a habit through a [diary, ratings, reviews, lists, a watchlist, follows, an activity feed and yearly stats](https://letterboxd.com/about/faq/), with entries that can be public, close friends only, or private. Beli replaced star ratings by [asking whether you liked a new place more or less than one you already rated](https://startupsignals.substack.com/p/beli-your-food-diary-and-dining-advisor), producing a score out of 10, and shows a taste-similarity score for each friend. That write-up credits word of mouth for Beli's growth from about 2.5 million ratings in 2022 to 58 million by mid-2025.

| Building block | From Letterboxd | From Beli | TasteSync's version |
| --- | --- | --- | --- |
| Logging | Diary entry with date, rating and review | Rate every place you visit | A visit with date, dishes, who you ate with, dine-in or delivery, optional photo and note |
| Scoring | Star rating | Compare against places you have ranked; score out of 10 | Pick loved, fine or not for me, then two to four quick comparisons; separate dine-in and delivery scores out of 10 |
| Lists | Custom lists and a watchlist | Bookmarks of places to try | Lists, a want-to-try list, and lists shared inside a circle |
| Social | Follow people, activity feed, likes and comments | Friends' lists and taste similarity | Follows plus circles: private group spaces with a shared board and "where tonight?" polls |
| Privacy | Public, close friends or private entries | — | Public, friends, circle-only or private, chosen per visit |
| Recap | Yearly stats | — | Monthly circle recap and a yearly "Year in Food" |

### Product principles

1. **Logging is the product.** If logging a meal takes more than 45 seconds, nothing else matters.
2. **Rank, don't rate.** Comparisons give honest, spread-out scores; star averages drift to 4.
3. **Friends first, crowd second.** Your circle's opinion is shown before the city's.
4. **Private by default inside groups.** People share more honestly when they choose the audience.
5. **Built for Hyderabad.** Irani cafés, biryani joints, street stalls and delivery-only kitchens are first-class places, and dishes matter as much as restaurants. Ordering in is reviewed as seriously as eating out.

## Core experience

The core loop is log, rank, share, discover: every meal logged makes your own list sharper and gives your friends a reason to open the app.

### The logging flow (target: under 45 seconds)

1. **Find the place.** Search by name, or pick from places near the location in the location bar. If it is missing, add it with a map pin (it goes to a review queue). Logging from Order in starts as delivery.
2. **Say how you ate.** Dine-in, takeaway or delivery. Default: dine-in. Takeaway and delivery go to your delivery ranking and add four quick delivery checks.
3. **Tag what you had.** Pick dishes from the place's list or type new ones; mark a standout dish with a heart.
4. **Tag who you were with.** Friends you tag get a prompt to log their own take.
5. **Pick a feeling.** Loved it, it was fine, or not for me.
6. **Compare.** Answer two to four "which was better?" questions against places you have already ranked the same way (dine-in or delivery). Your score out of 10 appears.
7. **Choose the audience.** Public, friends, one or more circles, or private. Default: friends.
8. **Optional extras.** A photo, a short note, price per person, and a share card for WhatsApp or Instagram.

Only steps 1, 5 and 6 are required. Everything else can be added later from the diary.

### Features

| Feature | What the user sees | Why it matters |
| --- | --- | --- |
| Discover | A location-scoped home screen: friends' shelves first, then data-driven shelves such as Hottest right now and Cheap and best, then everything nearby | Answers "where should I eat around here?" with friends before strangers |
| Diary | Every visit by date, with the month's count and a calendar view | The memory people come back for, like Letterboxd's diary |
| My ranking | Two ranked lists, dine-in and delivery, with scores out of 10, filterable by cuisine and area | The thing nobody else has: your honest top list |
| Want-to-try | A saved list of places, with friends' scores beside each | Turns browsing into a plan |
| Lists | Named lists such as "Best late-night biryani" or "Date spots in Jubilee Hills" | Shareable, searchable taste |
| Place page | Dine-in and delivery scores from you, friends, the circle and the city; delivery checks; top dishes and recent visits | Answers "should I go?" with people you know |
| Dish pages | The dishes people heart most at each place, and which ones travel well | Hyderabad orders by dish as much as by restaurant |
| Feed | Friends' visits, rankings and new lists; like and comment | Reasons to open the app daily |
| Profile | Top 4 places, stats, lists and recent diary | Identity and something to show off |
| Share cards | An image of a visit, a list or a top 10, sized for WhatsApp and Instagram stories | The main way new people hear about the app |
| Year in Food | Places, dishes, areas and top picks for the year | A yearly reason to post and invite |

## Discover and location

Discover is the home screen. It takes its sense of place from Swiggy and Zomato and its shelves from Letterboxd: your location decides which part of the city you see, and shelves of places fill the page, with friends first.

### Location, the Swiggy and Zomato way

- **A location bar at the top of Discover and Search**, such as "📍 Home · Jubilee Hills ▾". Tapping it opens a sheet with "Use current location", your saved places and the list of launch areas.
- **Three ways to set it:** the phone's GPS (asked only when the person taps "Use current location"), a saved place (Home, Work or a named spot), or picking an area. The label comes from the nearest launch area.
- **Never blocked.** Without location permission, the app uses the last place chosen, then the home area from sign-up, then asks the person to pick an area.
- **Eat out or Order in.** A switch under the location bar, like Zomato's Dining and Delivery tabs, maps onto the two rankings:

| | Eat out | Order in |
| --- | --- | --- |
| Places shown | Everything except delivery-only kitchens | Delivery-only kitchens and places that deliver |
| Default radius | 5 km, with 2 km, 10 km and all-Hyderabad chips | 7 km from the chosen point |
| Scores shown and sorted by | Dine-in scores | Delivery scores and delivery checks |
| Logging from here | Starts as dine-in | Starts as delivery |

**Privacy:** unlike a delivery app, TasteSync never needs your address. Saved places live only on the phone. The location is sent with each search or Discover request, used for that request, and never stored or logged. The server keeps only the home area chosen at sign-up.

### What Discover shows

Shelves appear in this order. A shelf with nothing to show is hidden, never padded.

| Shelf | What is on it | Available |
| --- | --- | --- |
| Your friends loved this week | Places friends ranked in their loved band in the last 7 days, nearest first | With friends (M4) |
| Want-to-try near you | Your want-to-try places inside the radius | With lists (M6) |
| Your circle's board | The top 5 of each circle's board for the current mode | With circles (M5) |
| Hottest right now | See the shelf rules below | Per area, once it qualifies |
| Cheap and best | See the shelf rules below | Per area, once it qualifies |
| Highest rated | See the shelf rules below | Per area, once it qualifies |
| Hidden gems | See the shelf rules below | Per area, once it qualifies |
| Good for delivery (Order in only) | Delivery city score 7.0+ and "Arrives hot" 70%+ | Per area, once it qualifies |
| New on TasteSync | Places approved in the last 30 days | Per area, once it qualifies |
| All places near you | Every place in the radius, nearest first | Always |

**Each place card shows:** name, area and distance, cuisine, price band (₹ to ₹₹₹₹), the friends' score when friends have ranked it (otherwise the city score, labelled), and "3 friends have been". The first photo is used when there is one.

### Shelf rules

Shelves are computed from logged data by the nightly job and are the same for everyone in an area. **Money never puts a place on a shelf or moves it up.** All shelves use only public and friends-level rankings, and exclude owners' rankings, as the city score does.

| Shelf | Rule | Sorted by |
| --- | --- | --- |
| Hottest right now | Heat of 3.0 or more from at least 3 different people in the last 14 days, and a city score of 7.0 or more. Heat adds up recent visits, each counting half as much for every week of age | Heat |
| Cheap and best | Price band ₹ (about ₹300 or less per person) and a city score of 7.5 or more | City score |
| Highest rated | At least 5 rankings | City score |
| Hidden gems | City score of 8.0 or more from 3 to 9 rankings | City score |

- **Price band** comes from the median price per person that people log (at least 3 reports): ₹ up to ₹300, ₹₹ up to ₹700, ₹₹₹ up to ₹1,500, ₹₹₹₹ above. Until then, it is set when the place is seeded or reviewed.
- **Minimum size.** A data-driven shelf shows in an area only when at least 8 places qualify within reach of that area. In the beta, most areas will show friends' shelves and the nearby list only, and the data-driven shelves turn on area by area as logging grows, matching how areas open (Gate C).
- **Gaming.** Hottest counts only accounts with 3 or more logged visits and needs 3 or more different people, so one person logging the same place daily cannot make it hot.

## Circles: the shared space

A circle is a private group of 2 to 25 people, such as college friends, an office lunch gang or family, with its own feed, its own ranked board and a way to decide where to eat. It is the feature that sets TasteSync apart from a personal food diary, and it is the main growth loop.

### What a circle has

| Part | How it works |
| --- | --- |
| Circle feed | Visits members shared to the circle, newest first, with likes and comments |
| Circle board | Places ranked by the circle's average score, counting only places at least two members have ranked, with a dine-in and a delivery view |
| Been there | On any place page, which circle members have been and their scores |
| Shared lists | Lists any member can add to, such as "Next Friday dinner" |
| Where tonight? | Anyone starts an eat-out or order-in poll with 2 to 5 places; members vote for every place they would accept; the place with most votes wins, ties go to the higher circle score |
| Ate together | Tag circle members on a visit; each gets a prompt to add their own ranking |
| Monthly recap | Most-visited place, the circle's top new find and who logged most |
| Invite link | One link to share on WhatsApp; joining needs only a phone number |

### Privacy levels

Every visit gets one audience, chosen at logging time and changeable later.

| Level | Who sees the visit | Counts toward |
| --- | --- | --- |
| Public | Anyone, including logged-out web visitors | Your ranking, friends' views, circles you share it to, city scores |
| Friends | People you follow who follow you back | Your ranking, friends' views, city scores (anonymised) |
| Circle | Members of the circles you choose | Your ranking and those circles' boards |
| Private | Only you | Your ranking only |

Your own ranking always includes every visit, so privacy never makes your list worse.

### Circle rules

- The creator is the admin and can remove members or hand admin to someone else.
- Leaving a circle hides your future visits from it; past visits shared there stay unless you delete them.
- A person can be in up to 10 circles at launch, to keep feeds readable.
- Circles are invite-only in v1; there are no public or discoverable circles.

## Delivery reviews

Delivery is a full review criterion, not a footnote: a place can be great to sit in and poor to order from, or the other way round. So every user keeps two separate rankings, dine-in and delivery, and every place shows two scores.

### How a delivery review works

- **Which visits count.** Delivery and takeaway visits go into the delivery ranking, because in both cases the food travels before you eat it. Dine-in visits go into the dine-in ranking.
- **Comparisons stay like-for-like.** A delivery visit is only compared with other places in your delivery ranking.
- **Delivery-only kitchens** have only a delivery score. Places that do not deliver have only a dine-in score.
- **The score is about the food as it arrived**, not the delivery app or the rider. Delivery time is recorded and shown, but it does not change the score.

### Delivery checks

After the feeling and comparisons, a delivery visit asks four one-tap questions. They are optional, but the flow defaults to showing them.

| Check | Answers | Shown on the place page as |
| --- | --- | --- |
| How did it arrive? | Hot, warm, cold | "Arrives hot" percentage |
| Packaging | Held up, some spill, leaked | "Packaging holds" percentage |
| Order accuracy | All correct, something missing or wrong | "Orders correct" percentage |
| Compared with eating there | Better, same, worse, haven't eaten there | "Travels well" percentage (same or better) |

Two optional extras: which app or channel you ordered through (Swiggy, Zomato, direct or other) and roughly how many minutes it took. Both are shown as context only.

### What people see

| Where | Dine-in | Delivery |
| --- | --- | --- |
| Place page | Your, friends', circle and city dine-in scores | The same four scores for delivery, plus the check percentages once there are at least 5 delivery visits |
| Dish page | Hearts from dine-in visits | "Travels well" for the dish: share of its delivery visits that arrived hot or warm and with packaging that held |
| My ranking | Dine-in tab | Delivery tab |
| Circle board | Dine-in switch | Delivery switch |
| "Where tonight?" | Eat out poll, ranked by dine-in scores | Order in poll, ranked by delivery scores |

Search and lists can filter by "good for delivery": places with a delivery city score of 7.0 or more and "Arrives hot" of 70% or more.

## Ranking and taste match

Each person keeps two ranked lists, dine-in and delivery, and a place's score out of 10 comes from where it sits in the matching list, not from a star they pick. Everything below applies to each list separately. The design below is a proposal inspired by Beli's comparison approach; the bands and constants should be tuned with real logs.

### Step 1: pick a band

| Feeling | Score band |
| --- | --- |
| Loved it | 7.0 to 10.0 |
| It was fine | 4.0 to 6.9 |
| Not for me | 0.0 to 3.9 |

### Step 2: place it with comparisons

The app compares the new place with the middle place in that band, then the middle of the remaining half, and so on (binary insertion). A band of 15 places needs at most 4 questions. If a band grows past 15, stop after 4 questions and place it in the narrowed range; later comparisons can refine it. "Too close to call" puts it right beside the place it was compared with.

### Step 3: turn position into a score

With k places in a band running from low to high, the place at position p (1 is best) scores:

```latex
s = \text{low} + (\text{high} - \text{low}) \cdot \frac{k - p + 1}{k + 1}
```

Scores are spread evenly inside the band and never touch its edges, so a band of one sits in the middle. Scores shift slightly as a list grows, which is expected: they describe your list today.

**Example.** Your loved band holds four biryani places scoring 9.4, 8.8, 8.2 and 7.6. You log a new place, and it beats the third, then the second, then loses to the first (three questions), so it lands at position 2. The band now scores 9.5, 9.0, 8.5, 8.0 and 7.5, and the new place shows 9.0.

### Scores other people see

- **Friends' score:** the average of scores from friends who ranked the place the same way (dine-in or delivery), each weighted by your taste match with them. Until taste match ships, it is a plain average.
- **Which visit sets a ranking's audience and weight:** a ranking takes its audience and its "hosted" flag from the latest visit behind it.
- **Circle score:** the plain average of members' scores, shown only when at least two members ranked it.
- **City score:** a smoothed, weighted average of public and friends-level rankings from accounts with at least three logged visits. Hosted meals count at weight 0.5 and all others at 1. With weights w, scores s, the city mean mu for that list and a prior of m = 3:

```latex
\text{city} = \frac{\sum_i w_i s_i + m\,\mu}{\sum_i w_i + m}
```

A place with three unhosted rankings of 8.5, 9.0 and 7.5, in a city whose mean is 7.0, shows 7.7 rather than 8.3. Dine-in and delivery city scores are computed separately, each with its own city mean.

### Taste match

For two people who have both ranked at least three of the same places in the same way (dine-in with dine-in, delivery with delivery), agreement is one minus their average score gap divided by 10. It is pulled toward 50% until they share more places, with a prior of k = 5:

```latex
\text{match} = \frac{n \cdot \text{agreement} + 5 \times 0.5}{n + 5}
```

**Example.** Ravi and Asha share six places, with score gaps of 0.5, 1.0, 0.0, 2.0, 1.5 and 0.5. Agreement is 91%, and the shown taste match is 72%. It rises toward 91% as they rank more places in common.

Taste match is shown on profiles and used to weight friends' scores. It is never shown for fewer than three shared places.

## Users and hypotheses

The first users are people in Hyderabad who eat out or order in several times a week with the same friends, and who already argue in group chats about where to go.

| User | Job to be done | What would make them stay |
| --- | --- | --- |
| The logger | Remember every place and dish, and keep an honest personal ranking | A diary and top list that feel like theirs, with stats |
| The group planner | Get the group to agree on a place fast | "Where tonight?" polls and a circle board the group trusts |
| The follower | Eat well without doing research | Friends' scores and lists on every place page |
| The newcomer to Hyderabad | Find good food fast in a new city | Taste-matched people and public lists for their area |

The logger is the most important: without people who log, nobody else has anything to see.

### Hypotheses to test before building much

Thresholds are proposals to agree on before the test.

| # | Hypothesis | How to test | Pass signal |
| --- | --- | --- | --- |
| H1 | People will log meals if it takes under 45 seconds | Clickable prototype with 15 testers timed on 5 logs each | Median log time under 45 seconds |
| H2 | Comparisons feel better than stars | Same testers rate 10 places both ways, then pick one | 70% prefer comparisons |
| H3 | Friend groups keep logging without reminders from you | 5 real groups use a simple version (or a shared sheet) for 3 weeks | 3 of 5 groups still log 2 or more visits per member per week in week 3 |
| H4 | Circles drive invites | Track invite links from the 5 groups | Each member brings 1.5 or more new people on average |
| H5 | Friends' scores change where people eat | Ask after each "where tonight?" decision | Half of decisions cite a friend's score or list |
| H6 | People will review delivery, not just dine-in | Share of logged visits that are delivery or takeaway in the 3-week test, and check completion | 25% or more of visits are delivery, and 60% of those answer all four checks |

## MVP scope

The MVP is the full personal loop plus circles, for Hyderabad only, as iOS and Android apps. Milestones M1 and M2 ship first to TestFlight and Google Play internal testing and serve as the prototype for H1 and H2.

| Area | In the MVP | Next | Not now |
| --- | --- | --- | --- |
| Logging | Visit with place, mode, dishes, companions, feeling, comparisons, audience, photo, note; delivery checks for delivery and takeaway | Edit comparisons later; bulk import from a notes list | Video |
| Ranking | Separate dine-in and delivery rankings; friends' and circle scores | City scores and taste match once there are enough rankings | Any paid influence on scores |
| Delivery | Delivery checks, "Arrives hot", "Packaging holds", "Orders correct" and "Travels well" on place pages | "Good for delivery" filter; dish travel scores | Links into Swiggy or Zomato |
| Diary and lists | Diary, want-to-try, custom lists | Collaborative public lists | Exportable guides |
| Social | Follow, feed, likes, comments, profiles with top 4 | Taste-matched suggestions of people to follow | Direct messages |
| Circles | Feed, board, shared lists, eat-out and order-in polls, ate-together tags, invite links | Monthly recap | Public circles |
| Places | Hyderabad catalogue, add-a-place with review, dish lists, price bands | Opening hours, menus | Ordering inside the app |
| Discover and location | Location bar with GPS, saved places on the phone and area picker; Eat out / Order in; Discover with friends', want-to-try and circle shelves and all places nearby | Data-driven shelves per area once 8 places qualify; a "For you" shelf weighted by taste match | Curated or paid collections; storing location history |
| Sharing | Share cards for visits, lists and top 10 | Year in Food | Embeds on other sites |

### User stories and acceptance criteria

1. **Log a visit.** As a user, I log where I ate and how much I liked it.
   - Done when a visit can be saved with only place, feeling and comparisons.
   - Done when the median time to log, measured in the app, is under 45 seconds for dine-in and under 60 seconds for delivery with all checks.
   - Done when a visit can be edited or deleted later, and the ranking updates.
2. **Review a delivery order.** As a user, I log a delivery or takeaway and say how it arrived.
   - Done when the visit goes into my delivery ranking and is compared only with other delivery places.
   - Done when the four delivery checks are one tap each and can be skipped.
   - Done when a place page shows the check percentages once it has 5 or more delivery visits.
3. **Rank a place.** As a user, I answer quick comparisons and see a score.
   - Done when no more than 4 questions are asked per visit.
   - Done when "too close to call" and "skip for now" both work; skipped places sit unranked in the band until ranked.
4. **See my ranking and diary.** As a user, I browse my places by score and by date.
   - Done when the ranking has dine-in and delivery tabs, each filterable by area and cuisine, and the diary shows a month calendar.
5. **Follow friends.** As a user, I find friends and see their visits.
   - Done when I can find people by username or invite link; contact matching is opt-in only.
6. **Create a circle.** As a user, I start a circle and invite friends over WhatsApp.
   - Done when a new member joins with a phone number and lands on the circle feed.
   - Done when the circle board shows only places at least two members ranked, with dine-in and delivery views.
7. **Decide where to eat.** As a circle member, I start an eat-out or order-in poll and the circle votes.
   - Done when a poll closes at a set time or when the admin closes it, and the winner is posted to the circle feed.
8. **Share a card.** As a user, I share a visit or list to WhatsApp or Instagram.
   - Done when the card links to a public web page, or to an invite page if the visit is not public.
9. **Add a missing place.** As a user, I add a place with a name and a map pin.
   - Done when I can log it immediately, and it shows to others only after review.

## Hyderabad launch plan

Grow by friend group, not by download: each group that logs for a month brings the next group in, and the app opens to the public only once the first areas feel full.

### 1. Seed the places before anyone signs up

Start with about 500 places across 10 areas: Jubilee Hills, Banjara Hills, Gachibowli, Madhapur and Hitec City, Kondapur, Kukatpally, Ameerpet, Begumpet, Secunderabad and the Old City. Add your own and your friends' regulars first, so the first search almost always finds the place.

| Source | Use | Caution |
| --- | --- | --- |
| Your own and friends' lists | First 150 to 200 places, with dishes | Slow, but highest quality |
| OpenStreetMap | Names, locations and categories | Requires attribution and has share-alike terms; check the licence before use |
| A maps API (Google, Mapbox or similar) | Search, autocomplete, map pins | Terms often limit storing data; keep only what the terms allow |
| Users adding places | Street stalls and new openings | Review before others see them; merge duplicates |

### 2. Recruit the first circles

- Pick 10 friend groups you can reach directly: college friends, office lunch groups, family groups and food-loving friends.
- Onboard each group in person or on a call; create their circle and log their last 10 meals together, so the app is useful on day one.
- Run a weekly check-in with one person per group for the first month.

### 3. Build in growth loops

| Loop | How it brings new people |
| --- | --- |
| Circle invite | A circle is only useful when the whole group is in it |
| Ate together | Tagging a friend who is not on the app sends them an invite to rank the meal |
| Share cards | Visits, lists and top 10s posted to WhatsApp and Instagram link back to the app |
| "Where tonight?" | A poll link shared to a group chat works for non-members, who join to vote |
| Year in Food | A yearly recap people want to post |

### 4. Open area by area

Keep sign-ups invite-only until the first areas have enough rankings. Then open with a waitlist by area, starting where most of the early groups eat. A reasonable bar: at least 150 places with three or more rankings in an area before opening it.

## Trust and safety

Trust comes mostly from the design: scores you see first come from people you know, and city scores are smoothed so a handful of fake rankings cannot move a place far.

| Threat | Defence |
| --- | --- |
| Fake accounts boosting a place | Phone sign-in, rate limits, and city scores that only count accounts with at least three logged visits |
| Pushing a place onto Hottest | Heat needs at least 3 different qualifying accounts; repeat visits from one person add little because each week halves their weight |
| Owners or staff ranking their own place | A "this is my place" flag; their rankings are excluded from that place's city scores |
| Hosted or free meals | A "this meal was hosted" checkbox on the visit, shown on the visit and counted at half weight in city scores |
| Delivery blamed for things outside the kitchen | Delivery time is shown as context only and never changes the score; checks focus on food, packaging and accuracy |
| Harassment in comments | Report, block and mute; circle admins can remove comments |
| Unfair or defamatory notes about a place | Report flow with a response time; notes stay the author's, but clearly false claims can be removed |
| Spam invites | Limit invites per day; invite links expire after 7 days unless renewed |

Keep moderation small at launch: one queue for new places, reports and duplicate merges, checked daily.

## Edge cases

### Places

| Case | Handling |
| --- | --- |
| Same place added twice with different spellings | Fuzzy name match within 150 m before saving; moderators merge and keep all visits. If a user ranked both copies in the same list, the better position is kept |
| Chains with many branches | Each branch is its own place, grouped under a brand page |
| Several delivery-only brands at one kitchen address | Separate places, marked delivery-only |
| A place closes or moves | Mark closed or moved; rankings stay in personal lists with a "closed" tag |
| Street stalls with no address | Map pin plus a landmark note |

### Rankings

| Case | Handling |
| --- | --- |
| First ever visit in a list, nothing to compare with | Skip comparisons; the place sits in the middle of its band |
| Same place visited again the same way | Ask "still where it was?"; one tap keeps the position, or re-run the comparisons |
| Same place reviewed for dine-in and later for delivery | It joins the delivery list separately; the dine-in rank is untouched |
| A user changes their mind about an old place | Allow drag-to-reorder in each list; scores update |
| A comparison against a place visited years ago | Show the last visit date beside it; allow "don't remember" to skip |

### Delivery

| Case | Handling |
| --- | --- |
| Order through an app under a brand name that differs from the restaurant | Search matches brand names; moderators link brands to places |
| One cloud kitchen running several brands | Each brand is its own delivery-only place |
| Order arrived very late or the rider spilled it | Packaging and temperature checks capture it; time is shown as context only |
| A user orders delivery from a place that has no delivery listing | Allow it; the place gains a delivery score from that visit |
| Group order where friends ate different dishes | One visit per person; each tags their own dishes |
| Takeaway eaten in the car right away | Logged as takeaway, so it counts as delivery; the user can switch it to dine-in if that is fairer |

### Privacy and groups

| Case | Handling |
| --- | --- |
| A private visit tagged with a friend | The friend sees only a prompt to log their own visit, not your score or note |
| A circle member leaves | Their future visits stop appearing; past shared visits stay unless they delete them |
| A user is removed from a circle | They lose access at once; the board recomputes |
| Account deletion | Delete visits, rankings and photos; remove them from friends' and circle scores within 30 days |
| Contact matching | Opt-in only; numbers are matched by keyed hash on the server and the address book is never stored |
| Location permission denied | The app uses the last chosen place, then the home area, then asks the person to pick an area; it never blocks |
| Chosen point outside Hyderabad | Show the nearest launch area and a note that TasteSync is Hyderabad-only for now |
| An area with few rankings | Hide data-driven shelves there; show friends' shelves and all places nearby |
| A minor signs up | Block sign-up under 18 in v1 and ask for date of birth at sign-up |

## Data model

The MVP needs 29 tables built around four things: places, visits, each person's two rankings (dine-in and delivery), and circles. The schema targets PostgreSQL 14 or later with PostGIS and pg_trgm.

The schema lives in the repo at `db/migrations/0001_init.sql` and is the single source of truth; this document does not repeat it.

| Group | Tables |
| --- | --- |
| People | users, follows, blocks, push_tokens |
| Places | areas, brands, places, dishes |
| Visits and rankings | visits, delivery_checks, visit_dishes, visit_companions, rankings, comparisons |
| Lists and circles | lists, list_items, circles, circle_members, visit_circles, polls, poll_options, poll_votes |
| Social, scores and operations | likes, comments, taste_matches, place_scores, reports, jobs, events |

Every feature reads from visits (what you ate) and rankings (where it sits in your dine-in or delivery list); circles, lists and scores are built around those two tables.

### Design notes

- A person's ranking is one row per place and experience in rankings; visits are the diary. A second visit adds a visit row and may move the ranking row.
- Visit experience is generated from mode, so dine-in goes to the dine-in list and takeaway or delivery goes to the delivery list without app code deciding it.
- The API must reject a delivery_checks row for a dine-in visit; a trigger can enforce this later.
- The position constraint is deferred, so a whole band can be reordered inside one transaction. Saving a visit locks the user's band rows first, so two quick saves cannot collide.
- Comparisons are kept, each tied to its visit, so rankings can be rebuilt if the scoring method changes.
- Comparisons run on the phone: the app loads the band, asks the questions locally, and sends the answers with the visit. The API replays the answers with the same shared code to get the position; it never trusts a position from the app.
- Score columns are stored for fast reads and recomputed by the API or a nightly job; place_scores and taste_matches are nightly batch outputs. In the beta, delivery check percentages are computed when a place page is read.
- Sign-in uses Firebase phone auth; users stores the Firebase id and an HMAC of the phone number, not the number itself.
- Account deletion: foreign keys that point at a user either cascade or are set to null. A circle admin who deletes their account hands admin to the longest-standing member first; a circle with no other members is deleted.
- The feed is built at read time from visits, rankings and lists in the MVP; add a feed table only when that gets slow.
- Discover shelves are defined in code (`packages/core/src/discovery.ts`), not in tables. The nightly job writes each place's shelf inputs (heat, recent visitors, median price) to place_scores, and the API filters them by the requested point and radius. Locations in requests are never written to the database or the logs.
- Audience rules are enforced in the API, and each read query filters by them. Test them carefully: privacy bugs would be the worst kind of bug here.

## System architecture

Native iOS and Android apps, one TypeScript API, one PostgreSQL database and a small worker process are enough until well past the Hyderabad launch. The apps and the API share one TypeScript package for ranking and scoring, so the comparison logic runs the same on the phone and on the server.

&#91;embedded content: system architecture · 2 clients, API, database, workers, 4 services\]

The API and workers both call outside services: the API for sign-in, uploads and map search, and the workers for share-card images, nightly scores and notifications.

### Stack decisions

| Layer | Choice | Why | Revisit when |
| --- | --- | --- | --- |
| Apps | Expo (React Native, TypeScript) with Expo Router; EAS Build, Submit and Update | One codebase for real iOS and Android apps with push, camera and contacts; small fixes ship over the air without store review | A screen needs native performance Expo cannot give |
| API | Node and TypeScript (Fastify, zod, Kysely) | Shares the ranking module and types with the apps; share cards render in TypeScript | The team is stronger in another language |
| Sign-in | Firebase phone auth; the API verifies Firebase tokens | SMS delivery in India is handled, so no DLT registration before the beta | SMS cost at scale; then move to an Indian SMS provider |
| Push | Expo push notifications | One service for both platforms | — |
| Database | PostgreSQL with PostGIS and pg\_trgm | Relational data, near-me queries and fuzzy name search in one place | Not at this scale |
| Jobs | A jobs table in Postgres claimed with row locking | One less system to run | Volume or latency outgrows it, then add Redis |
| Images | Object storage with a CDN; resize on upload | Photos and share cards are the heaviest traffic | — |
| Hosting | Managed Postgres and app hosting in an Indian region | Low latency in Hyderabad; simpler data-transfer questions | A needed service is unavailable in India |
| Monitoring | Error tracking, slow-query log, log-time metric | Logging speed is the core product metric | Always on |
| Public web pages | Plain HTML pages served by the API for share cards and invites | Share links must open without the app; a full web app is not needed | Logged-out web browsing becomes a goal |

## Build guide

Build in seven milestones, each ending in something a tester can use. Start with the ranking engine and privacy rules, because they are the hardest to change later.

### Milestones

| # | Milestone | Includes | Done when |
| --- | --- | --- | --- |
| M1 | Foundations | Repo, migrations, Firebase phone sign-in, area list, place import script, place search, development builds of both apps | A tester signs in on a real phone and finds 20 seeded places by name or near them |
| M2 | Log and rank | Visits, on-phone comparisons, two rankings, scores, diary, edit, delete and reorder; location bar, saved places and Eat out / Order in on search; TestFlight and Play internal builds | The worked examples in this doc pass as unit tests; a dine-in log takes under 45 seconds (H1) |
| M3 | Delivery | Delivery checks, place page with both scores and check percentages, dish travel score | A delivery log takes under 60 seconds with checks; percentages appear at 5 visits |
| M4 | Friends | Follows, feed, likes, comments, profiles, audience levels, report and block (needed for external TestFlight and store review) | Automated tests prove each audience level hides what it should |
| M5 | Circles | Create, invite link, join, circle feed, board, eat-out and order-in polls, ate-together prompts | A group of 5 creates a circle, logs, and decides a dinner through a poll |
| M6 | Lists, Discover and sharing | Want-to-try, custom and shared lists, the Discover screen with friends', want-to-try and circle shelves, share cards, public web pages | Discover shows the right shelves for a tester's location; a share card opens a public page or an invite page |
| M7 | Beta hardening | Moderation queue, account deletion in the app, nightly score and shelf jobs, store listings, privacy notice, demo login for store review | Both apps pass store review; the launch checklist and Gate B metrics can be measured |

### Screens

| Screen | Purpose |
| --- | --- |
| Sign in | Phone number and OTP, date of birth, username |
| Discover | Location bar, Eat out / Order in, shelves and all places nearby |
| Location sheet | Use current location, saved places, launch areas |
| Feed | Friends' and circles' recent visits |
| Log flow | Place, mode, dishes, companions, feeling, comparisons, delivery checks, audience |
| My rankings | Dine-in and delivery tabs with filters |
| Diary | Calendar and list of visits |
| Place page | Scores, delivery checks, dishes, friends who have been, recent visits |
| Search | Places by name, area, cuisine and "good for delivery", scoped by the location bar |
| Profile | Top 4, stats, lists, diary |
| Circle | Feed, board, shared lists, polls, members |
| Poll | Options, votes, result |
| Lists | Want-to-try and custom lists |
| Settings | Privacy defaults, contact matching opt-in, delete account |

The app has five tabs, the most Android allows: **Discover, Feed, Log, Circles and You**. My rankings, Diary, Lists and Want-to-try live under You, as Letterboxd keeps Diary and Watchlist on the profile. Until Feed and Circles exist, the prototype shows Log, Rankings, Diary and You.

### API endpoints

| Method and path | Purpose |
| --- | --- |
| POST /auth/session | Exchange a Firebase phone sign-in token for a session; creates the user on first sign-in |
| GET /me, PATCH /me | Own profile and settings |
| GET /users/{username}; POST and DELETE /users/{id}/follow | Profiles and follows |
| GET /areas?lat=&lng= | Launch areas with their centres, nearest first when a point is given (location sheet and bar label) |
| GET /places/search | Search by text, location, radius, mode (eat\_out or order\_in), area and cuisine |
| GET /discover?lat=&lng=&mode= | The Discover shelves for a point and mode |
| GET /places/{id}; POST /places | Place page data; add a place |
| POST /visits | Create a visit with dishes, companions, delivery checks, audience and the comparison answers given on the phone; returns the final position and score |
| PATCH /visits/{id}; DELETE /visits/{id} | Edit or delete a visit; rankings update |
| GET /me/rankings?experience=dine\_in or delivery&band=; PATCH /me/rankings/order | Read a list or one band (the phone loads the band before asking comparisons); drag to reorder |
| GET /me/diary?month= | Diary month view |
| GET /feed | Friends' and circles' activity |
| POST /visits/{id}/likes; POST /visits/{id}/comments | Reactions |
| POST /circles; POST /circles/join/{code}; GET /circles/{id}/feed; GET /circles/{id}/board?experience= | Circles |
| POST /circles/{id}/polls; POST /polls/{id}/votes; POST /polls/{id}/close | Polls |
| GET, POST /lists; POST /lists/{id}/items | Lists |
| GET /share/{kind}/{id} | Share card image and public page |
| POST /reports | Reports |

### Comparison session logic

This is the core algorithm. It lives in one well-tested module, `packages/core/src/ranking.ts`, used by both the app (to ask the questions) and the API (to replay the answers).

```ts
// Positions are 1-based; the new place will be inserted at a position in [lo, hi].
// Start with lo = 1, hi = k + 1 for a band of k places.
function nextQuestion(s: Search): { kind: "ask" | "done"; position: number } {
  if (s.lo >= s.hi) return { kind: "done", position: s.lo };
  const mid = Math.floor((s.lo + s.hi) / 2);
  if (s.asked >= MAX_QUESTIONS) return { kind: "done", position: mid };
  return { kind: "ask", position: mid };
}

function applyAnswer(s: Search, mid: number, outcome: Outcome): Search {
  const asked = s.asked + 1;
  switch (outcome) {
    case "better": return { lo: s.lo, hi: mid, asked };          // new place beats the one at mid
    case "worse":  return { lo: mid + 1, hi: s.hi, asked };
    case "tie":    return { lo: mid + 1, hi: mid + 1, asked };   // sits right below it
    case "skip":   return { ...s, asked };                       // "don't remember"
  }
}
```

When the search is done, places at or below the position shift down by one and every score in the band is recomputed with the step 3 formula. A "don't remember" answer counts toward the 4-question limit, so the session always ends. The server rejects answers that are not exactly the questions this code would have asked.

### Analytics events

Track these from M2 onward, since the launch gates depend on them: log\_started, log\_saved (with duration, mode, checks answered), comparison\_answered, comparison\_skipped, visit\_shared (with channel), invite\_sent, invite\_accepted (with source), circle\_created, poll\_created, poll\_closed, search\_performed (with result picked or place added), place\_added, location\_set (with source: gps, saved or area; never the coordinates), discover\_shelf\_opened (with shelf).

### Using this PRD with Claude Code

- This doc lives in the repo as docs/PRD.md and is imported from CLAUDE.md.
- Ask for one milestone at a time, and ask for tests first for the ranking module and the audience rules.
- Keep the worked examples in the ranking section as fixed test cases.

## Legal and privacy in India

Build to India's data protection rules from the start, because TasteSync holds phone numbers, locations, photos and who-ate-with-whom. The DPDP Rules were notified on November 13, 2025, and [most obligations apply from May 13, 2027](https://www.hlc.com/en/publications/indias-digital-personal-data-protection-act-2023-brought-into-force-), likely within a year of launch. This is a planning aid, not legal advice; have counsel review it before opening sign-ups.

| Area | What applies | What TasteSync does |
| --- | --- | --- |
| Notice and consent | Itemised, plain-language notice; consent for a stated purpose; withdrawing must be as easy as giving it | Short notice at sign-up; separate opt-ins for contact matching and location |
| Location | Location is personal data; collect only what the purpose needs | Used per request and never stored or logged; saved places stay on the phone; only the home area is kept on the server |
| Other people's data | Tagging a companion or matching contacts processes data about people who have not signed up | Store only a keyed hash (HMAC with a server secret) of the number for invites; delete it if they never join within 30 days |
| Breaches | Inform the Data Protection Board without delay, a detailed report within 72 hours, and notify affected people | Incident runbook, access logs; no raw phone numbers stored, only keyed hashes |
| Children | Verifiable parental consent before processing a child's data | Sign-up blocked under 18 in v1 |
| Deletion and retention | Data deleted when consent is withdrawn, unless law requires keeping it; some logs must be kept at least a year | One-tap account deletion; a log retention policy agreed with counsel |
| Content about businesses | Restaurants may object to notes about them | Report and takedown flow; ask counsel about intermediary duties and a grievance officer |
| Map and place data | Map providers and OpenStreetMap have licence terms | Check terms before storing or displaying their data |

## Success metrics

The north-star metric is weekly logged visits per active user: if people log, the diary, rankings, circles and city scores all improve on their own. Targets are proposals to set with your team.

| Metric | Definition | Target for the Hyderabad beta |
| --- | --- | --- |
| Weekly visits per active user | Visits logged in a week divided by users who opened the app that week | 2 or more |
| Median log time | From tapping "log" to saving | Under 45 seconds for dine-in; under 60 for delivery with checks |
| Comparison completion | Logged visits where all comparison questions were answered | 80% or more |
| Delivery share | Visits logged as delivery or takeaway | 25% or more |
| Delivery check completion | Delivery visits with all four checks answered | 60% or more |
| Week-4 retention | Share of a sign-up week still logging in week 4 | 25% or more |
| Users in an active circle | Users in a circle with at least one shared visit that week | 40% or more |
| Invites per new user | New sign-ups from invites, circles, tags and share cards, per existing user | 1.5 or more in the first month |
| Place coverage | Places in launch areas with three or more rankings (either list) | 150 per area before opening it |
| Search success | Searches where the user picks a result instead of adding a place | 90% or more |

### Launch gates

- **Gate A (start building the MVP):** H1 to H3 pass at their thresholds.
- **Gate B (open beyond invites):** week-4 retention of 25% or more and 40% of users in an active circle, for two weeks in a row.
- **Gate C (open more areas or cities):** an area reaches 150 places with three or more rankings, and counsel has reviewed the notice and takedown process.

## Roadmap

The plan reaches an invite-only Hyderabad beta in about 12 weeks and opens to the public around week 21, if each checkpoint is met.

&#91;embedded content: roadmap · 4 phases, 3 checkpoints\]

The validate phase uses the M1 and M2 builds as the prototype: TestFlight and Google Play internal testing need no store review, so testers time real logs. The five groups can use those builds or a shared sheet. Plan one to two weeks before the beta for the first App Store and Play reviews; social apps with user content need report, block and in-app account deletion to pass. In the open phase, each new area opens only when it passes Gate C.

## Parked ideas

These ideas came from earlier versions of the brief. None is in the plan until Gate B is passed, and each should come back only if it strengthens logging and circles.

| Idea | Why it is parked | What to check before reviving it |
| --- | --- | --- |
| Food creators and reel links | Changes the product from friends-first to audience-first | Do users ask to follow local critics? Instagram and YouTube API limits and terms |
| Order buttons into Swiggy and Zomato | No public deep-link or affiliate API was found in earlier research | Talk to both companies; test plain links on Android and iOS |
| Verified-diner badges | Check-ins and receipts are easy to fake and heavy on privacy | Real evidence of fake rankings first |
| Tiers and perks with restaurants | Needs restaurant supply and could bias rankings | Restaurant demand; a rule that perks never touch scores |
| Revenue (claimed pages, labelled sponsored slots) | Too early; could undermine trust | Retention, and a firm rule that money never changes rank |

## Risks, open questions and next steps

The biggest risk is that logging feels like homework: if friends stop logging after the first week, nothing else in this plan works.

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Logging fatigue after the novelty wears off | High | 45-second flow, only three required steps, ate-together prompts, monthly recaps |
| Empty app for someone with no friends on it | High | Invite-only beta in full friend groups; seeded places; public lists for their area |
| A privacy mistake exposes a private visit | High | Audience checks on every read, automated tests for each audience level |
| Two rankings feel like double the work | Medium | The mode picks the list automatically; delivery checks are skippable |
| Comparisons feel tedious with long lists | Medium | Cap at 4 questions; allow skip and drag-to-reorder |
| Thin place catalogue (missing street stalls, delivery brands) | Medium | Seed by hand; fast add-a-place; daily moderation |
| A bigger app copies the idea | Medium | Local depth in Hyderabad and strong friend groups; move fast |

### Open questions

1. Have you checked whether Beli or another ranking app already has users in Hyderabad?
2. Which 5 friend groups can you recruit for the validate phase this month?
3. Should takeaway count as delivery (the current plan) or get its own list?
4. Who builds the MVP, and how many hours a week? That sets the real length of each phase.
5. Is a final name chosen? Check that the name and domain are free before the beta.

### Next steps

- [ ] Recruit 5 friend groups and run the 3-week logging test, including delivery orders
- [ ] Build a clickable prototype of the logging, comparison and delivery-check flow and time 15 testers
- [ ] List 150 to 200 places you and your friends already eat at or order from
- [ ] Agree the thresholds for H1 to H6 and the beta targets
- [ ] Start milestone M1 of the build guide
- [ ] Brief counsel on the privacy notice and takedown flow

### Sources

- [Letterboxd help and FAQ page](https://letterboxd.com/about/faq/): diary, ratings, lists, watchlist, follows, feed, yearly stats and visibility options
- [Startup Signals: Beli, your food diary and dining advisor](https://startupsignals.substack.com/p/beli-your-food-diary-and-dining-advisor): comparison ranking, scores out of 10, taste similarity, growth figures
- [Hogan Lovells: India's DPDP Act brought into force](https://www.hlc.com/en/publications/indias-digital-personal-data-protection-act-2023-brought-into-force-): phased dates, breach, children's data and retention rules, November 17, 2025
