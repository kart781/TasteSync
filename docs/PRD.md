# TasteSync PRD v4: The Food App You Can Trust

Oct 18, 2026 · updated Oct 22, 2026 · @Karthik Bhusarapu

**Changes in v4 (Oct 22, 2026):** iOS-only launch; Android and web are out of scope for now. TasteSync is repositioned from a friends' food diary to the food app people trust most when deciding where to eat, with three non-negotiables: no undisclosed paid content, reviews backed by proof of visit, and no paid ranking. New sections: competition, core user journeys, trust (verification and anti-fraud) and making money without breaking trust. Proof of visit is a receipt scan or a delivery order screenshot, read on the phone; unverified visits can still be shared with friends and circles but never get a badge or count toward city scores, shelves or public reviews. Dishes get a one-tap rating, taste match moves into the MVP, "hosted" becomes "comped or hosted" with strikes for not disclosing, and the logging target drops to 30 seconds. Open food-lover groups wait for Gate B. Taste Capsule (monthly stats) and Blend (two-person taste overlap) are planned for after Gate B.

**Changes in v3.1 (Oct 21, 2026):** native iOS and Android apps built with Expo, plus a TypeScript API (replaces the PWA and FastAPI). Comparisons run on the phone and are sent with the visit. Schema fixes: `comparisons.visit_id`, account deletion no longer blocked by foreign keys, Firebase sign-in, HMAC phone hashes, and new `jobs`, `blocks`, `push_tokens` and `events` tables. Rules added for ranking audience and hosted weight, the MVP friends' score, and duplicate rankings on place merge.

**Changes in v3.2 (Oct 21, 2026):** new "Discover and location" section. Discover is a location-scoped home screen with Letterboxd-style shelves, friends first. Location works like Swiggy and Zomato (a location bar, saved places and an Eat out / Order in switch), but saved places stay on the phone and locations are never stored. Data-driven shelves (Hottest right now, Cheap and best, Highest rated, Hidden gems) have fixed rules and turn on per area once 8 places qualify. Schema: area centres, place price bands and delivery flags, and shelf inputs in place\_scores. App tabs: Discover, Feed, Log, Circles, You.

## Executive summary

TasteSync is a food discovery and social app built by foodies, for foodies, and the place people trust most when deciding where to eat. You log every place you eat at or order from in under 30 seconds, rank it against places you already know, rate the dishes, and prove you were there. What you see comes from friends first, then from verified diners whose taste matches yours, never from paid creators or strangers' star averages.

### The problem

1. **Discovery you can't trust.** Food creators are often paid or fed for free, and nothing tells you so. Google and Yelp ratings are inflated, can be bought, and come from strangers whose taste you don't know.
2. **No good place to share what you ate.** Food posts get lost in Instagram stories and group chats, and they never add up to anything useful later.

### What we are building

- **Trusted discovery:** reviews from verified diners, ordered by how close the reviewer's taste is to yours, with no paid placement.
- **A food diary and social feed:** after a meal, dine-in or delivery, post what you ate in under 30 seconds and share it with friends, a private circle, or everyone.
- **Community:** circles of friends now, food-lover groups later. Your reviews build your reputation and your taste profile.

### Non-negotiables

1. **No undisclosed paid content.** A comped or hosted meal is always labelled, and hiding it costs the reviewer their badge.
2. **Reviews are backed by proof of visit.** Only visits verified with a receipt or an order screenshot reach the public, city scores and shelves.
3. **Restaurants can never pay to change rankings.** No paid placement, sponsored shelves or boosts, in any form, ever.

The wedge is one city and real friend groups. Launch on iOS in Hyderabad with about 10 friend groups (roughly 100 people) who already eat out together, prove they keep logging for a month, then open up area by area. Android and web come later.

**The promise to a user:** "Know what you actually loved, remember where you went, and decide where to eat tonight with people whose taste you trust."

**What is in v1:** logging and ranking for dine-in and delivery, dish ratings, proof of visit, taste match, a personal diary, lists and want-to-try, following people, circles, and share cards for WhatsApp and Instagram.

**What is deliberately out for now:** Android and web, open food-lover groups, creator tools, delivery-app links and perks. All paid ranking is out permanently. Ways to earn money that keep trust are planned for after Gate B.

**The bar:** a product its users are proud to recommend and its builders are proud to have built.

## Competition and our gap

| App | What it does | How TasteSync compares |
| --- | --- | --- |
| Beli | Friends rank restaurants against each other; taste-matched recommendations | The closest match. Strong rankings, but weak posts about the food itself, and it works well only in big US cities |
| Google Maps and Yelp | Huge review databases | The trust problem: reviews from strangers, easy to game |
| Zomato and Swiggy Dineout | Reviews plus delivery and table booking | They earn from restaurants, so restaurants have a stake in the reviews |
| The Infatuation and Eater | Reviews by editors | Trustworthy, but a few voices, with no friends or community |
| Corner and Mapstr | Saving and sharing places on a map | Lists of places, not reviews of dishes |
| Instagram, TikTok and Lemon8 | Food content from creators | The undisclosed-creator problem TasteSync fixes |
| Untappd and Letterboxd | Log, rate and share with friends, outside food | The model for how logging should feel |

**Our gap:** Beli proved that a social, trust-based food app works. Nobody owns the combination of **reviews tied to a proven visit**, **rated dish by dish**, **covering delivery as well as dine-in**, with **a feed of friends sharing what they ate**.

**When people say "Beli plus Instagram":** Beli tells you a friend liked a place. TasteSync tells you they really went, what to order, whether it survives delivery, and how far to trust them, because you can see how closely their taste matches yours.

## Product vision

TasteSync takes the habit loop from Letterboxd and the scoring engine from Beli, adds proof of visit, and makes people you trust, not the public crowd, the main source of opinions.

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

1. **Logging is the product.** If logging a meal takes more than 30 seconds, nothing else matters.
2. **Rank, don't rate.** Comparisons give honest, spread-out scores; star averages drift to 4.
3. **People you trust first.** Friends first, then verified reviewers whose taste matches yours, never strangers' averages.
4. **Proof before praise.** Only verified visits count toward anything the public sees.
5. **Money never moves a ranking.** Not for restaurants, not for creators, not for us.
6. **Private by default inside groups.** People share more honestly when they choose the audience.
7. **Built for Hyderabad.** Irani cafés, biryani joints, street stalls and delivery-only kitchens are first-class places, and dishes matter as much as restaurants. Ordering in is reviewed as seriously as eating out.

## Core experience

The core loop is log, rank, share, discover: every meal logged makes your own list sharper and gives your friends a reason to open the app.

### Core user journeys

1. **Post a meal in 30 seconds.** Asha finishes lunch at an Irani café, taps Log, picks the café from places nearby, taps "Loved it", answers three comparisons, and saves. It shows 8.7 in her dine-in list. Delivery works the same way, and opening Log from Order in starts as delivery.
2. **Verify it.** Before leaving, or any time in the next 7 days, she scans the receipt. The phone reads it, the server checks it, and the visit gets the Verified badge, so she can now share it publicly. For a Swiggy or Zomato order, she uses the order confirmation screenshot instead.
3. **Decide where to eat tonight.** Ravi opens Discover with Order in on. Friends' picks come first, then verified reviews ordered by taste match ("Priya matches you 87%"). He shortlists two places and starts a poll in his circle; the winner is posted back.
4. **Find the best dish nearby.** Meera searches "biryani" with a 3 km radius. She sees the places where verified diners rated the biryani loved, with the best taste-matched places first, and "What to order here" on each place page.
5. **Join a circle from WhatsApp.** Kiran gets an invite link in the office group chat, signs in with a phone number, and lands on the circle's feed and board.

### The logging flow (target: under 30 seconds)

1. **Find the place.** Search by name, or pick from places near the location in the location bar. If it is missing, add it with a map pin (it goes to a review queue). Logging from Order in starts as delivery.
2. **Say how you ate.** Dine-in, takeaway or delivery. Default: dine-in. Takeaway and delivery go to your delivery ranking and add four quick delivery checks.
3. **Tag what you had.** Pick dishes from the place's list or type new ones, and give each one a one-tap rating: loved, fine or not for me.
4. **Tag who you were with.** Friends you tag get a prompt to log their own take.
5. **Pick a feeling.** Loved it, it was fine, or not for me.
6. **Compare.** Answer two to four "which was better?" questions against places you have already ranked the same way (dine-in or delivery). Your score out of 10 appears.
7. **Choose the audience.** Public (verified visits only), friends, one or more circles, or private. Default: friends.
8. **Verify.** Scan the receipt or the delivery order screenshot. It can be done now or within 7 days from the diary.
9. **Optional extras.** A photo, a short note, price per person, "comped or hosted", and a share card for WhatsApp or Instagram.

Only steps 1, 5 and 6 are required. Everything else can be added later from the diary. The 30-second target covers steps 1 to 7; scanning adds about 10 seconds and can be done later. "Comped or hosted" must be ticked when it applies: it is a disclosure, not an extra (see Trust).

### Features

| Feature | What the user sees | Why it matters |
| --- | --- | --- |
| Discover | A location-scoped home screen: friends' shelves first, then data-driven shelves such as Hottest right now and Cheap and best, then everything nearby | Answers "where should I eat around here?" with friends before strangers |
| Diary | Every visit by date, with the month's count and a calendar view | The memory people come back for, like Letterboxd's diary |
| My ranking | Two ranked lists, dine-in and delivery, with scores out of 10, filterable by cuisine and area | The thing nobody else has: your honest top list |
| Want-to-try | A saved list of places, with friends' scores beside each | Turns browsing into a plan |
| Lists | Named lists such as "Best late-night biryani" or "Date spots in Jubilee Hills" | Shareable, searchable taste |
| Proof of visit | Scan a receipt or a delivery order screenshot; the visit gets a Verified badge | The trust layer: only proven visits reach the public |
| Place page | Dine-in and delivery scores from you, friends, the circle and the city; delivery checks; "What to order here"; reviews ordered friends first, then verified reviewers by taste match | Answers "should I go?" with people you know or whose taste matches yours |
| Dish ratings | One-tap loved, fine or not for me per dish; "What to order here"; dish search by distance; which dishes travel well | Hyderabad orders by dish as much as by restaurant |
| Feed | Friends' visits, rankings and new lists; like and comment | Reasons to open the app daily |
| Profile | Top 4 places, stats, lists, recent diary, verified share and taste match with you | Identity and a reputation built on proven visits |
| Share cards | An image of a visit, a list or a top 10, sized for WhatsApp and Instagram stories | The main way new people hear about the app |
| Year in Food | Places, dishes, areas and top picks for the year | A yearly reason to post and invite |
| Taste Capsule (after Gate B) | Monthly stats on places, areas, cuisines and top picks | A reason to come back each month, and a card to post |
| Blend (after Gate B) | Your taste match with a friend, places you both loved, and their picks you haven't tried | Turns a friend's history into your next meal; a card people share |

## Trust: verification and anti-fraud

Trust is the moat. Three things earn it: proof that the reviewer was there, honest disclosure of free meals, and scores that money cannot touch.

### Proof of visit

| Method | What the person does | What leaves the phone |
| --- | --- | --- |
| Receipt | Takes a photo of the bill | The merchant name, date, total and bill number, read on the phone with Apple's Vision text recognition. The image is never uploaded |
| Delivery order screenshot | Picks the Swiggy, Zomato or other order confirmation screenshot | The restaurant name, order date and order id, read on the phone. The delivery address is stripped before anything is sent |

**The server checks every proof:**
- The name matches the place, or a brand linked to it, by fuzzy name match. A receipt from another branch of the same brand is accepted only if that branch is the place being logged.
- The receipt or order date is within 2 days of the visit date, and the proof is added within 7 days of the visit.
- A fingerprint of the proof (an HMAC of merchant, date, total and bill or order number) is unique. One proof verifies one visit by one account, so a receipt cannot be passed around.
- Proofs come only from the genuine app (Apple App Attest), with a rate limit per account.

**What verified unlocks:**

| | Verified visit | Unverified visit |
| --- | --- | --- |
| Badge | Verified badge on the visit | None |
| Audiences | Public, friends, circles or private | Friends, circles or private |
| Your own ranking and diary | Yes | Yes |
| Friends' and circle scores | Yes | Yes, shown as "4 of 6 verified" |
| City scores, shelves, public reviews, dish search, taste-matched reviews | Yes | No |

Group meals with one bill: whoever holds the bill can verify their own visit; companions can verify with their own receipt or order, or stay unverified.

### Anti-fraud

| Signal | Response |
| --- | --- |
| A proof fingerprint already used | Rejected with "this receipt has already been used" |
| Many proofs from one account in a day, or the same total at many places | Flagged to the moderation queue; proofs paused until reviewed |
| A verified review is reported as fake | Spot audit: the author re-scans the proof within 7 days or the visit loses its badge |
| A modified app sending invented receipt text | App Attest blocks proofs from anything but the genuine app; spot audits catch the rest |

The rules that already protect scores stay: city scores count only accounts with three or more logged visits, scores are smoothed, and Hottest needs three or more different people.

### Disclosure

- **"Comped or hosted"** is a checkbox on every visit for a meal that was free, discounted or paid for by the restaurant. It is always shown on the visit, cannot be hidden, and the visit counts at half weight in city scores.
- **Not disclosing.** When a report that a meal was comped but not disclosed is confirmed, the profile shows a visible strike, and all of that person's reviews lose their badges for 90 days. A third strike suspends the account.
- **No star limits.** Capping top ratings, as some apps do, is not needed: comparisons place every place relative to the others, so scores are already spread out.

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

Shelves are computed from logged data by the nightly job and are the same for everyone in an area. **Money never puts a place on a shelf or moves it up.** All shelves use only verified, public and friends-level rankings, and exclude owners' rankings, as the city score does.

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
| Public (verified visits only) | Anyone, including logged-out web visitors | Your ranking, friends' views, circles you share it to, city scores, public reviews |
| Friends | People you follow who follow you back | Your ranking, friends' views, city scores (anonymised, verified visits only) |
| Circle | Members of the circles you choose | Your ranking and those circles' boards |
| Private | Only you | Your ranking only |

Your own ranking always includes every visit, verified or not, so privacy and proof never make your list worse.

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
| Dish page | Ratings from dine-in visits | "Travels well" for the dish: share of its delivery visits that arrived hot or warm and with packaging that held |
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

- **Friends' score:** the average of scores from friends who ranked the place the same way (dine-in or delivery), each weighted by your taste match with them, falling back to a plain average for friends with fewer than three shared places. It shows how many of those rankings are verified.
- **Which visit sets a ranking's audience, weight and proof:** a ranking takes its audience, its "comped or hosted" flag and its verified status from the latest visit behind it.
- **Circle score:** the plain average of members' scores, shown only when at least two members ranked it.
- **Reviews on a place page:** friends first, then other verified public reviews ordered by taste match with you, each showing the match ("Priya matches you 87%"). Reviewers with a strong match can be followed.
- **City score:** a smoothed, weighted average of verified public and friends-level rankings from accounts with at least three logged visits. Comped or hosted meals count at weight 0.5 and all others at 1. With weights w, scores s, the city mean mu for that list and a prior of m = 3:

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

Taste match is in the MVP, because trusted discovery depends on it. It is shown on profiles and reviews, orders public reviews, and weights friends' scores. It is never shown for fewer than three shared places.

### Dish ratings

Each dish tagged on a visit gets a one-tap rating: loved, fine or not for me. Dishes are rated, not ranked, so logging stays under 30 seconds.

- **What to order here:** on a place page, the dishes with the highest share of loved ratings, weighted by taste match with you, with at least 3 ratings each.
- **Dish search:** searching for a dish, such as "biryani" within 3 km, lists places by the share of verified diners who loved that dish there.
- Full dish rankings, with comparisons per dish type, come later if people ask for them.

### Taste Capsule and Blend (after Gate B)

Two features borrowed from Spotify's Sound Capsule and Blend. Both are built from data the MVP already stores, so they need no new logging.

**Taste Capsule** is a monthly summary of your eating, with Year in Food as the yearly version.
- **What it shows:**
  - places visited, and how many were new
  - the dine-in and delivery split
  - areas and cuisines covered
  - your top 3 places and top dish of the month
  - your most-loved new find
  - your verified share
  - your longest logging streak
  - how your taste moved, such as "more delivery, more Old City"
- **Data:** all your own visits, including private ones, because it is your data. A Capsule is shown only to you, unless you share it.
- **Share card:** for WhatsApp and Instagram stories, with the watermark. It shows counts, plus place names from public and friends-level visits only, never private or circle-only places.

**Blend** compares your taste with one friend's.
- **Starting and leaving:** you send a Blend invite to a mutual friend; once they accept, both of you see the Blend. Either person can leave at any time, which deletes it for both.
- **What it shows:**
  - **Taste match:** the formula above, hidden under 3 shared places.
  - **Places you both loved.**
  - **Where you disagree most:** your biggest score gaps.
  - **Their loved places you haven't tried:** verified visits first, near your location bar.
  - **Your loved places they haven't tried.**
  - **A shared want-to-try list** both of you can add to.
- **Privacy:** a Blend shows only visits the other person's audience settings already let you see: public, friends, or a circle you are both in. It never reveals private visits, or circle-only visits from circles you are not in.
- **Share card:** the match percentage and two or three shared loves.
- **Circle Blend** comes after the two-person Blend. It shows a whole circle's shared loves and the best place nobody in it has tried yet, and can start a "Where tonight?" poll.

## Users and hypotheses

The first users are people in Hyderabad who eat out or order in several times a week with the same friends, and who already argue in group chats about where to go.

| User | Job to be done | What would make them stay |
| --- | --- | --- |
| The logger | Remember every place and dish, and keep an honest personal ranking | A diary and top list that feel like theirs, with stats |
| The group planner | Get the group to agree on a place fast | "Where tonight?" polls and a circle board the group trusts |
| The follower | Eat well without doing research | Friends' scores and lists on every place page |
| The newcomer to Hyderabad | Find good food fast in a new city | Taste-matched people and public lists for their area |
| The trusted foodie | Be known for good taste without being a paid creator | Verified reviews that build a reputation, a high taste match with many people, and followers who act on their picks |

The logger is the most important: without people who log, nobody else has anything to see. The trusted foodie is the logger who also verifies and shares publicly; the first 50 to 100 known Hyderabad foodies seed the public layer.

### Hypotheses to test before building much

Thresholds are proposals to agree on before the test.

| # | Hypothesis | How to test | Pass signal |
| --- | --- | --- | --- |
| H1 | People will log meals if it takes under 30 seconds | TestFlight build with 15 testers timed on 5 logs each | Median log time under 30 seconds |
| H2 | Comparisons feel better than stars | Same testers rate 10 places both ways, then pick one | 70% prefer comparisons |
| H3 | Friend groups keep logging without reminders from you | 5 real groups use a simple version (or a shared sheet) for 3 weeks | 3 of 5 groups still log 2 or more visits per member per week in week 3 |
| H4 | Circles drive invites | Track invite links from the 5 groups | Each member brings 1.5 or more new people on average |
| H5 | Friends' scores change where people eat | Ask after each "where tonight?" decision | Half of decisions cite a friend's score or list |
| H6 | People will review delivery, not just dine-in | Share of logged visits that are delivery or takeaway in the 3-week test, and check completion | 25% or more of visits are delivery, and 60% of those answer all four checks |
| H7 | People will add proof to their visits | Share of visits verified within 7 days in the 3-week test | 50% or more of visits verified |

## MVP scope

The MVP is the full personal loop, proof of visit and circles, for Hyderabad only, as an iOS app. Milestones M1 and M2 ship first to TestFlight and serve as the prototype for H1 and H2. Android and web come after the iOS beta passes Gate B.

| Area | In the MVP | Next | Not now |
| --- | --- | --- | --- |
| Logging | Visit with place, mode, dishes, companions, feeling, comparisons, audience, photo, note, "comped or hosted"; delivery checks for delivery and takeaway | Edit comparisons later; bulk import from a notes list; share-sheet import of Swiggy or Zomato order confirmations | Video |
| Trust | Receipt and order-screenshot proof, Verified badge, App Attest, proof fingerprints, spot audits, disclosure strikes | — | Location-based proof; check-ins |
| Ranking | Separate dine-in and delivery rankings; friends' and circle scores; taste match on profiles and reviews | City scores once there are enough verified rankings | Any paid influence on scores |
| Dishes | One-tap dish ratings, "What to order here", dish search by distance | Full dish rankings; on-device photo recognition to tag the dish | — |
| Delivery | Delivery checks, "Arrives hot", "Packaging holds", "Orders correct" and "Travels well" on place pages | "Good for delivery" filter; dish travel scores | Links into Swiggy or Zomato |
| Diary and lists | Diary, want-to-try, custom lists | Collaborative public lists | Exportable guides |
| Social | Follow, feed, likes, comments, profiles with top 4 and verified share | Taste-matched suggestions of people to follow; Blend with a friend, then Circle Blend | Direct messages |
| Circles and community | Private circles: feed, board, shared lists, eat-out and order-in polls, ate-together tags, invite links | Open food-lover groups and a community feed (after Gate B); monthly recap | — |
| Places | Hyderabad catalogue, add-a-place with review, dish lists, price bands | Opening hours, menus | Ordering inside the app |
| Discover and location | Location bar with GPS, saved places on the phone and area picker; Eat out / Order in; Discover with friends', want-to-try and circle shelves and all places nearby | Data-driven shelves per area once 8 places qualify; a "For you" shelf weighted by taste match | Curated or paid collections; storing location history |
| Sharing | Share cards for visits, lists and top 10 | Instagram story export with a watermark; Taste Capsule (monthly) and Year in Food; food passport and streaks | Embeds on other sites |
| iOS extras | — | Home-screen widget ("friends ate here this week"); a Live Activity reminding you to rate a meal | — |
| Platforms | iOS | Android from the same code; web pages beyond share links | — |

### User stories and acceptance criteria

1. **Log a visit.** As a user, I log where I ate and how much I liked it.
   - Done when a visit can be saved with only place, feeling and comparisons.
   - Done when the median time to log, measured in the app, is under 30 seconds for dine-in or delivery, and under 45 seconds for delivery with all four checks.
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
10. **Verify a visit.** As a user, I prove I ate there with a receipt or a delivery order screenshot.
    - Done when a receipt or screenshot is read on the phone and only the extracted fields are sent; the image never leaves the phone.
    - Done when a matching proof added within 7 days gives the visit a Verified badge and unlocks the Public audience.
    - Done when a proof already used by any account, or one whose name or date doesn't match, is rejected with a clear reason.
    - Done when unverified visits never appear in city scores, shelves, public reviews or dish search.
11. **Rate the dishes.** As a user, I tap loved, fine or not for me on each dish I tag.
    - Done when each dish rating is one tap and optional.
    - Done when a place page shows "What to order here" once a dish has 3 or more ratings.
12. **Disclose a free meal.** As a user, I tick "comped or hosted" when the restaurant paid.
    - Done when the label always shows on the visit and the visit counts at half weight in city scores.
    - Done when a moderator can confirm a non-disclosure report, which adds a strike and removes the person's badges for 90 days.

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
| Blend cards (after Gate B) | A Blend card posted to WhatsApp or Instagram shows two friends' match; people join to Blend with their own friends |

### 4. Open area by area

Keep sign-ups invite-only until the first areas have enough rankings. Then open with a waitlist by area, starting where most of the early groups eat. A reasonable bar: at least 150 places with three or more rankings in an area before opening it.

## Trust and safety

Trust comes mostly from the design: scores you see first come from people you know or whose taste matches yours, only verified visits reach the public, and city scores are smoothed so a handful of fake rankings cannot move a place far. Verification and disclosure are described under "Trust: verification and anti-fraud".

| Threat | Defence |
| --- | --- |
| Fake accounts boosting a place | Phone sign-in, rate limits, verified visits only, and city scores that only count accounts with at least three logged visits |
| Fake or edited receipts and screenshots | Server name and date checks, App Attest, anomaly flags and spot audits on reported reviews |
| One receipt shared among friends | Proof fingerprints: each receipt or order verifies one visit by one account |
| A screenshot of someone else's order | One order verifies one account; a reported review triggers a spot audit |
| A restaurant offering money or free meals for good reviews | Undisclosed comps cost the reviewer their badges; restaurants can never pay to change scores, and paid relationships are listed publicly |
| Pushing a place onto Hottest | Heat needs at least 3 different qualifying accounts; repeat visits from one person add little because each week halves their weight |
| Owners or staff ranking their own place | A "this is my place" flag; their rankings are excluded from that place's city scores |
| Comped or hosted meals | A "comped or hosted" checkbox on the visit, always shown and counted at half weight in city scores; confirmed non-disclosure adds a strike |
| Delivery blamed for things outside the kitchen | Delivery time is shown as context only and never changes the score; checks focus on food, packaging and accuracy |
| Harassment in comments | Report, block and mute; circle admins can remove comments |
| Unfair or defamatory notes about a place | Report flow with a response time; notes stay the author's, but clearly false claims can be removed |
| Spam invites | Limit invites per day; invite links expire after 7 days unless renewed |

Keep moderation small at launch: one queue for new places, reports, proof flags, disclosure reports and duplicate merges, checked daily.

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
| A Blend partner makes a visit private | It disappears from the Blend at once |
| A Blend partner unfollows or blocks | The Blend is deleted for both |
| A Blend with fewer than 3 shared places | Show what is shared and "rank a few more to see your match", with no percentage |

### Proof of visit

| Case | Handling |
| --- | --- |
| Group meal with one bill | The person with the bill verifies their visit; others verify with their own receipt or order, or stay unverified |
| Receipt from another branch of the same brand | Accepted only when that branch is the place being logged; otherwise rejected with "this receipt is from another branch" |
| Street stall with no receipt | The visit stays unverified: it counts for the person and their friends and circles, but not publicly |
| Receipt text unreadable | Ask for a clearer photo; after two tries, offer to verify later from the diary |
| Proof added after 7 days | Rejected; the visit stays unverified |
| Visit edited to a different place after verifying | The badge is removed and the proof is released for that visit only |
| Visit deleted | Its proof fingerprint is kept, so the same receipt cannot verify another visit |

## Data model

The MVP needs 31 tables built around four things: places, visits, each person's two rankings (dine-in and delivery), and circles. The schema targets PostgreSQL 14 or later with PostGIS and pg_trgm.

The schema lives in the repo in `db/migrations/` (starting with `0001_init.sql`; proof of visit and dish ratings are added in `0004_trust.sql`) and is the single source of truth; this document does not repeat it.

| Group | Tables |
| --- | --- |
| People | users, follows, blocks, push_tokens |
| Places | areas, brands, places, dishes |
| Visits and rankings | visits, delivery_checks, visit_dishes, visit_companions, rankings, comparisons, proofs |
| Lists and circles | lists, list_items, circles, circle_members, visit_circles, polls, poll_options, poll_votes |
| Social, scores and operations | likes, comments, taste_matches, place_scores, reports, disclosure_strikes, jobs, events |

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
- Taste Capsule and Blend (after Gate B) are computed at read time from visits, rankings and taste_matches; a `blends` table (two users and a created date) is added when Blend is built.
- Discover shelves are defined in code (`packages/core/src/discovery.ts`), not in tables. The nightly job writes each place's shelf inputs (heat, recent visitors, median price) to place_scores, and the API filters them by the requested point and radius. Locations in requests are never written to the database or the logs.
- Audience rules are enforced in the API, and each read query filters by them. Test them carefully: privacy bugs would be the worst kind of bug here.

## System architecture

A native iOS app, one TypeScript API, one PostgreSQL database and a small worker process are enough until well past the Hyderabad launch. The app and the API share one TypeScript package for ranking and scoring, so the comparison logic runs the same on the phone and on the server.

&#91;embedded content: system architecture · 2 clients, API, database, workers, 4 services\]

The API and workers both call outside services: the API for sign-in, uploads and map search, and the workers for share-card images, nightly scores and notifications.

### Stack decisions

| Layer | Choice | Why | Revisit when |
| --- | --- | --- | --- |
| App | Expo (React Native, TypeScript) with Expo Router; EAS Build, Submit and Update; iOS only at launch | A real iOS app with push, camera, Apple Vision text recognition and App Attest through native modules; small fixes ship over the air without App Store review; Android can follow from the same code | A screen needs native performance Expo cannot give, or widgets and Live Activities need more than Expo's native targets |
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
| M1 | Foundations | Repo, migrations, Firebase phone sign-in, area list, place import script, place search, an iOS development build | A tester signs in on a real phone and finds 20 seeded places by name or near them |
| M2 | Log and rank | Visits, on-phone comparisons, two rankings, scores, diary, edit, delete and reorder; location bar, saved places and Eat out / Order in on search; TestFlight builds | The worked examples in this doc pass as unit tests; a dine-in log takes under 30 seconds (H1) |
| M3 | Delivery, dishes and proof | Delivery checks, place page with both scores and check percentages, dish ratings and "What to order here", dish travel score, receipt and order-screenshot proof with App Attest, "comped or hosted" | A delivery log takes under 45 seconds with checks; percentages appear at 5 visits; a reused or mismatched proof is rejected (H7) |
| M4 | Friends and taste match | Follows, feed, likes, comments, profiles, audience levels (Public needs a verified visit), taste match, reviews ordered by taste match, report and block (needed for external TestFlight and App Store review) | Automated tests prove each audience level hides what it should and that unverified visits never reach public reads |
| M5 | Circles | Create, invite link, join, circle feed, board, eat-out and order-in polls, ate-together prompts | A group of 5 creates a circle, logs, and decides a dinner through a poll |
| M6 | Lists, Discover and sharing | Want-to-try, custom and shared lists, the Discover screen with friends', want-to-try and circle shelves, dish search by distance, share cards, public web pages | Discover shows the right shelves for a tester's location; a share card opens a public page or an invite page |
| M7 | Beta hardening | Moderation queue with proof flags, spot audits and disclosure strikes, account deletion in the app, nightly score and shelf jobs, App Store listing, privacy notice, demo login for App Review | The app passes App Store review; the launch checklist and Gate B metrics can be measured |

### Screens

| Screen | Purpose |
| --- | --- |
| Sign in | Phone number and OTP, date of birth, username |
| Discover | Location bar, Eat out / Order in, shelves and all places nearby |
| Location sheet | Use current location, saved places, launch areas |
| Feed | Friends' and circles' recent visits |
| Log flow | Place, mode, dishes with ratings, companions, feeling, comparisons, delivery checks, audience, verify |
| My rankings | Dine-in and delivery tabs with filters |
| Diary | Calendar and list of visits |
| Place page | Scores, delivery checks, What to order here, friends who have been, reviews ordered by taste match |
| Search | Places by name, area, cuisine and "good for delivery", scoped by the location bar |
| Profile | Top 4, stats, lists, diary |
| Circle | Feed, board, shared lists, polls, members |
| Poll | Options, votes, result |
| Lists | Want-to-try and custom lists |
| Verify | Scan a receipt or pick an order screenshot; shows what was read before sending |
| Settings | Privacy defaults, contact matching opt-in, delete account |

The app has five tabs, the most an iOS tab bar shows without a "More" tab: **Discover, Feed, Log, Circles and You**. My rankings, Diary, Lists and Want-to-try live under You, as Letterboxd keeps Diary and Watchlist on the profile. Until Feed and Circles exist, the prototype shows Log, Rankings, Diary and You.

### API endpoints

| Method and path | Purpose |
| --- | --- |
| POST /auth/session | Exchange a Firebase phone sign-in token for a session; creates the user on first sign-in |
| GET /me, PATCH /me | Own profile and settings |
| GET /users/{username}; POST and DELETE /users/{id}/follow | Profiles and follows |
| GET /areas?lat=&lng= | Launch areas with their centres, nearest first when a point is given (location sheet and bar label) |
| GET /places/search | Search by text, dish, location, radius, mode (eat\_out or order\_in), area and cuisine |
| GET /discover?lat=&lng=&mode= | The Discover shelves for a point and mode |
| GET /places/{id}; POST /places | Place page data; add a place |
| POST /visits | Create a visit with dishes, companions, delivery checks, audience and the comparison answers given on the phone; returns the final position and score |
| PATCH /visits/{id}; DELETE /visits/{id} | Edit or delete a visit; rankings update |
| POST /visits/{id}/proof | Verify a visit with the fields read from a receipt or order screenshot, plus an App Attest assertion; returns verified or the reason it failed |
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

Track these from M2 onward, since the launch gates depend on them: log\_started, log\_saved (with duration, mode, checks answered), comparison\_answered, comparison\_skipped, visit\_shared (with channel), invite\_sent, invite\_accepted (with source), circle\_created, poll\_created, poll\_closed, search\_performed (with result picked or place added), place\_added, location\_set (with source: gps, saved or area; never the coordinates), discover\_shelf\_opened (with shelf), capsule\_viewed, capsule\_shared, blend\_invited, blend\_accepted, blend\_left, proof\_started and proof\_result (with method and outcome; never the extracted text), dish\_rated, comped\_disclosed.

### Using this PRD with Claude Code

- This doc lives in the repo as docs/PRD.md and is imported from CLAUDE.md.
- Ask for one milestone at a time, and ask for tests first for the ranking module, the audience rules and the rule that unverified visits never reach public reads.
- Keep the worked examples in the ranking section as fixed test cases.

## Legal and privacy in India

Build to India's data protection rules from the start, because TasteSync holds phone numbers, locations, photos, details read from receipts and orders, and who-ate-with-whom. The DPDP Rules were notified on November 13, 2025, and [most obligations apply from May 13, 2027](https://www.hlc.com/en/publications/indias-digital-personal-data-protection-act-2023-brought-into-force-), likely within a year of launch. This is a planning aid, not legal advice; have counsel review it before opening sign-ups.

| Area | What applies | What TasteSync does |
| --- | --- | --- |
| Notice and consent | Itemised, plain-language notice; consent for a stated purpose; withdrawing must be as easy as giving it | Short notice at sign-up; separate opt-ins for contact matching, location, and camera or photo access for proofs |
| Location | Location is personal data; collect only what the purpose needs | Used per request and never stored or logged; saved places stay on the phone; only the home area is kept on the server |
| Other people's data | Tagging a companion or matching contacts processes data about people who have not signed up | Store only a keyed hash (HMAC with a server secret) of the number for invites; delete it if they never join within 30 days |
| Breaches | Inform the Data Protection Board without delay, a detailed report within 72 hours, and notify affected people | Incident runbook, access logs; no raw phone numbers stored, only keyed hashes |
| Children | Verifiable parental consent before processing a child's data | Sign-up blocked under 18 in v1 |
| Deletion and retention | Data deleted when consent is withdrawn, unless law requires keeping it; some logs must be kept at least a year | One-tap account deletion; a log retention policy agreed with counsel |
| Content about businesses | Restaurants may object to notes about them | Report and takedown flow; ask counsel about intermediary duties and a grievance officer |
| Map and place data | Map providers and OpenStreetMap have licence terms | Check terms before storing or displaying their data |
| Receipts and order screenshots | Receipts and order confirmations can show names, phone numbers, addresses and card digits | Read on the phone; only the merchant or restaurant name, date, total and bill or order number are sent; images are never uploaded; the server keeps the match result and a keyed fingerprint, not the extracted text. Covered in the notice |

## Making money without breaking trust

TasteSync earns nothing at launch. Revenue starts only after Gate B, and only in ways that cannot change what people see.

**Never, in any form:**
- Paid placement in search, Discover, shelves, reviews or dish search
- Sponsored shelves or labelled sponsored slots
- Affiliate or booking fees that change the order of anything
- Any restaurant payment that touches scores, reviews or verification

**Later, in this order:**

| Stream | What it is | Why it keeps trust |
| --- | --- | --- |
| TasteSync Plus | A subscription for users: deeper taste match, unlimited lists, full stats and food passport | Users pay for features for themselves; rankings are the same for everyone |
| Restaurant analytics | A read-only subscription: how a place is rated, which dishes are loved, how delivery travels | Insight only: no boost, no hiding reviews, and no reply that changes anything |
| Booking fees | Once table booking exists, a flat fee per booking paid by the restaurant | The fee is the same for every place and never affects order or scores |

**Firewall rules:**
- The ranking and score code (`packages/core`) takes no inputs about payments, and no revenue data is readable by the score jobs.
- Every paid relationship with a restaurant is listed on a public transparency page.
- Staff and investors follow the same "comped or hosted" disclosure as everyone else.

## Success metrics

The north-star metric is weekly logged visits per active user: if people log, the diary, rankings, circles and city scores all improve on their own. The trust metrics show whether what people see deserves to be trusted. Targets are proposals to set with your team.

| Metric | Definition | Target for the Hyderabad beta |
| --- | --- | --- |
| Weekly visits per active user | Visits logged in a week divided by users who opened the app that week | 2 or more |
| Median log time | From tapping "log" to saving | Under 30 seconds for dine-in or delivery; under 45 for delivery with all four checks |
| Comparison completion | Logged visits where all comparison questions were answered | 80% or more |
| Delivery share | Visits logged as delivery or takeaway | 25% or more |
| Delivery check completion | Delivery visits with all four checks answered | 60% or more |
| Week-4 retention | Share of a sign-up week still logging in week 4 | 25% or more |
| Users in an active circle | Users in a circle with at least one shared visit that week | 40% or more |
| Invites per new user | New sign-ups from invites, circles, tags and share cards, per existing user | 1.5 or more in the first month |
| Place coverage | Places in launch areas with three or more rankings (either list) | 150 per area before opening it |
| Search success | Searches where the user picks a result instead of adding a place | 90% or more |
| Verified share | Public and friends-level visits that are verified | 60% or more |
| Proof completion | Visits verified within 7 days | 50% or more |
| Fraud and non-disclosure | Confirmed fake proofs and undisclosed comps per 1,000 verified reviews | Under 2 |
| Would recommend | Net Promoter Score from a monthly in-app question | 40 or more |

### Launch gates

- **Gate A (start building the MVP):** H1 to H3 and H7 pass at their thresholds.
- **Gate B (open beyond invites; start Android, food-lover groups and earning):** week-4 retention of 25% or more, 40% of users in an active circle, and a verified share of 60% or more, for two weeks in a row.
- **Gate C (open more areas or cities):** an area reaches 150 places with three or more rankings, and counsel has reviewed the notice and takedown process.

## Roadmap

The plan reaches an invite-only Hyderabad beta in about 12 weeks and opens to the public around week 21, if each checkpoint is met.

&#91;embedded content: roadmap · 4 phases, 3 checkpoints\]

The validate phase uses the M1 and M2 builds as the prototype: TestFlight internal testing needs no App Store review, so testers time real logs. The five groups can use those builds or a shared sheet. Plan one to two weeks before the beta for the first App Store review; social apps with user content need report, block and in-app account deletion to pass, and the proof flow needs a demo receipt for App Review. Android starts only after Gate B. In the open phase, each new area opens only when it passes Gate C.

## Parked ideas

These ideas came from earlier versions of the brief. None is in the plan until Gate B is passed, and each should come back only if it strengthens logging, trust and circles.

| Idea | Why it is parked | What to check before reviving it |
| --- | --- | --- |
| Food creators and reel links | Changes the product from trust-first to audience-first | Do users ask to follow local critics? Creators would follow the same proof and disclosure rules; Instagram and YouTube API limits and terms |
| Order buttons into Swiggy and Zomato | No public deep-link or affiliate API was found in earlier research | Talk to both companies; test plain links on iOS; any affiliate fee must never affect order or scores |
| Tiers and perks with restaurants | Needs restaurant supply and could bias rankings | Restaurant demand; perks would count as comps and must be disclosed |
| Location-based proof and check-ins | Needs location at posting time, which the privacy stance avoids; receipts and orders are stronger proof | Whether many visits stay unverified because there is no receipt |

## Risks, open questions and next steps

The biggest risk is that logging feels like homework: if friends stop logging after the first week, nothing else in this plan works. The second is that proof feels like a chore, leaving the public layer too thin to trust.

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Logging fatigue after the novelty wears off | High | 30-second flow, only three required steps, ate-together prompts, monthly recaps |
| Proof feels like work, so few visits are verified | High | Scanning is optional and can wait 7 days; a reminder from the diary; verified visits unlock Public and the badge; H7 tests it before the MVP is built |
| Cold start: trust needs density | High | One city, real friend groups, 50 to 100 known foodies seeding verified reviews, areas opened one at a time |
| Empty app for someone with no friends on it | High | Invite-only beta in full friend groups; seeded places; public lists for their area |
| A privacy mistake exposes a private visit | High | Audience checks on every read, automated tests for each audience level |
| Two rankings feel like double the work | Medium | The mode picks the list automatically; delivery checks are skippable |
| Comparisons feel tedious with long lists | Medium | Cap at 4 questions; allow skip and drag-to-reorder |
| Thin place catalogue (missing street stalls, delivery brands) | Medium | Seed by hand; fast add-a-place; daily moderation |
| A bigger app copies the idea | Medium | Local depth in Hyderabad and strong friend groups; move fast |
| Faked proofs from a modified app or edited screenshots | Medium | App Attest, fingerprints, anomaly flags, spot audits; on-device reading is a known limit, so audits matter |
| Group meals leave most diners unverified | Medium | Friends and circles still see their visits; measure the gap and revisit companion vouching if it is large |
| Seen as "Beli plus Instagram" | Medium | Lead with proof, dish ratings and delivery in every message and share card |
| App Store review of user content and receipt scanning | Medium | Report, block, account deletion, a clear camera and photo notice, and a demo account with a sample receipt |

### Open questions

1. Have you checked whether Beli or another ranking app already has users in Hyderabad?
2. Which 5 friend groups can you recruit for the validate phase this month?
3. Should takeaway count as delivery (the current plan) or get its own list?
4. Who builds the MVP, and how many hours a week? That sets the real length of each phase.
5. Is a final name chosen? Check that the name and domain are free before the beta.
6. Do enough Hyderabad places give itemised receipts with bill numbers? Collect 30 real receipts and order screenshots before building the proof reader.
7. Which on-device text reader: Apple Vision through an Expo native module, or an existing community module? Decided at M3 design.

### Next steps

- [ ] Recruit 5 friend groups and run the 3-week logging test, including delivery orders
- [ ] Time 15 testers logging on the TestFlight build of M1 and M2
- [ ] List 150 to 200 places you and your friends already eat at or order from
- [ ] Agree the thresholds for H1 to H7 and the beta targets
- [ ] Collect 30 real receipts and order screenshots to test proof reading
- [ ] Start milestone M1 of the build guide
- [ ] Brief counsel on the privacy notice and takedown flow

### Sources

- [Letterboxd help and FAQ page](https://letterboxd.com/about/faq/): diary, ratings, lists, watchlist, follows, feed, yearly stats and visibility options
- [Startup Signals: Beli, your food diary and dining advisor](https://startupsignals.substack.com/p/beli-your-food-diary-and-dining-advisor): comparison ranking, scores out of 10, taste similarity, growth figures
- [Hogan Lovells: India's DPDP Act brought into force](https://www.hlc.com/en/publications/indias-digital-personal-data-protection-act-2023-brought-into-force-): phased dates, breach, children's data and retention rules, November 17, 2025
