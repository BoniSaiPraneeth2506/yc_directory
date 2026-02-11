import { defineQuery } from "next-sanity";

// Paginated queries for infinite scroll (12 posts per page)
export const STARTUPS_QUERY_PAGINATED =
  defineQuery(`*[_type == "startup" && defined(slug.current) && (isDraft != true) && (!defined(scheduledFor) || scheduledFor <= now()) && (!defined($search) || title match $search || category match $search || author->name match $search)] | order(_createdAt desc) [$offset...$limit] {
  _id, 
  title, 
  slug,
  _createdAt,
  author -> {
    _id, name, image, bio
  }, 
  views,
  description,
  category,
  image,
  upvotes,
  tags
}`);

export const STARTUPS_BY_VIEWS_QUERY_PAGINATED =
  defineQuery(`*[_type == "startup" && defined(slug.current) && (isDraft != true) && (!defined(scheduledFor) || scheduledFor <= now()) && (!defined($search) || title match $search || category match $search || author->name match $search)] | order(views desc) [$offset...$limit] {
  _id, 
  title, 
  slug,
  _createdAt,
  author -> {
    _id, name, image, bio
  }, 
  views,
  description,
  category,
  image,
  upvotes,
  tags
}`);

export const STARTUPS_BY_UPVOTES_QUERY_PAGINATED =
  defineQuery(`*[_type == "startup" && defined(slug.current) && (isDraft != true) && (!defined(scheduledFor) || scheduledFor <= now()) && (!defined($search) || title match $search || category match $search || author->name match $search)] | order(coalesce(upvotes, 0) desc) [$offset...$limit] {
  _id, 
  title, 
  slug,
  _createdAt,
  author -> {
    _id, name, image, bio
  }, 
  views,
  description,
  category,
  image,
  upvotes,
  tags
}`);

export const STARTUPS_BY_TAG_QUERY_PAGINATED =
  defineQuery(`*[_type == "startup" && defined(slug.current) && (isDraft != true) && (!defined(scheduledFor) || scheduledFor <= now()) && $tag in tags && (!defined($search) || title match $search || category match $search || author->name match $search)] | order(_createdAt desc) [$offset...$limit] {
  _id, 
  title, 
  slug,
  _createdAt,
  author -> {
    _id, name, image, bio
  }, 
  views,
  description,
  category,
  image,
  upvotes,
  tags
}`);

export const STARTUPS_QUERY =
  defineQuery(`*[_type == "startup" && defined(slug.current) && (isDraft != true) && (!defined(scheduledFor) || scheduledFor <= now()) && (!defined($search) || title match $search || category match $search || author->name match $search)] | order(_createdAt desc) {
  _id, 
  title, 
  slug,
  _createdAt,
  author -> {
    _id, name, image, bio
  }, 
  views,
  description,
  category,
  image,
  upvotes,
  tags
}`);

export const STARTUPS_BY_VIEWS_QUERY =
  defineQuery(`*[_type == "startup" && defined(slug.current) && (isDraft != true) && (!defined(scheduledFor) || scheduledFor <= now()) && (!defined($search) || title match $search || category match $search || author->name match $search)] | order(views desc) {
  _id, 
  title, 
  slug,
  _createdAt,
  author -> {
    _id, name, image, bio
  }, 
  views,
  description,
  category,
  image,
  upvotes,
  tags
}`);

export const STARTUPS_BY_UPVOTES_QUERY =
  defineQuery(`*[_type == "startup" && defined(slug.current) && (isDraft != true) && (!defined(scheduledFor) || scheduledFor <= now()) && (!defined($search) || title match $search || category match $search || author->name match $search)] | order(coalesce(upvotes, 0) desc) {
  _id, 
  title, 
  slug,
  _createdAt,
  author -> {
    _id, name, image, bio
  }, 
  views,
  description,
  category,
  image,
  upvotes,
  tags
}`);

export const STARTUPS_TRENDING_QUERY =
  defineQuery(`*[_type == "startup" && defined(slug.current) && (isDraft != true) && (!defined(scheduledFor) || scheduledFor <= now()) && _createdAt > $weekAgo && (!defined($search) || title match $search || category match $search || author->name match $search)] | order(views desc, upvotes desc) {
  _id, 
  title, 
  slug,
  _createdAt,
  author -> {
    _id, name, image, bio
  }, 
  views,
  description,
  category,
  image,
  upvotes,
  tags
}`);

export const STARTUPS_BY_TAG_QUERY =
  defineQuery(`*[_type == "startup" && defined(slug.current) && (isDraft != true) && (!defined(scheduledFor) || scheduledFor <= now()) && $tag in tags && (!defined($search) || title match $search || category match $search || author->name match $search)] | order(_createdAt desc) {
  _id, 
  title, 
  slug,
  _createdAt,
  author -> {
    _id, name, image, bio
  }, 
  views,
  description,
  category,
  image,
  upvotes,
  tags
}`);

export const STARTUP_BY_ID_QUERY =
  defineQuery(`*[_type == "startup" && _id == $id][0]{
  _id, 
  title, 
  slug,
  _createdAt,
  author -> {
    _id, name, username, image, bio
  }, 
  views,
  description,
  category,
  image,
  pitch,
  upvotes,
  upvotedBy,
  tags
}`);

export const STARTUP_VIEWS_QUERY = defineQuery(`
    *[_type == "startup" && _id == $id][0]{
        _id, views
    }
`);


export const AUTHOR_BY_GITHUB_ID_QUERY = defineQuery(`
*[_type == "author" && id == $id][0]{
    _id,
    id,
    name,
    username,
    email,
    image,
    bio,
    savedStartups,
    upvotedStartups,
    followers,
    following
}
`);


export const AUTHOR_BY_ID_QUERY = defineQuery(`
*[_type == "author" && _id == $id][0]{
    _id,
    id,
    name,
    username,
    email,
    savedStartups,
    upvotedStartups,
    followers,
    following,
    image,
    bio
}
`);

export const FOLLOWERS_BY_AUTHOR_QUERY = defineQuery(`
*[_type == "author" && _id == $id][0].followers[]-> {
  _id,
  name,
  username,
  image,
  bio
}
`);

export const FOLLOWING_BY_AUTHOR_QUERY = defineQuery(`
*[_type == "author" && _id == $id][0].following[]-> {
  _id,
  name,
  username,
  image,
  bio
}
`);

export const STARTUPS_BY_AUTHOR_QUERY =
  defineQuery(`*[_type == "startup" && author._ref == $id && (isDraft != true) && (!defined(scheduledFor) || scheduledFor <= now())] | order(_createdAt desc) {
  _id, 
  title, 
  slug,
  _createdAt,
  author -> {
    _id, name, image, bio
  }, 
  views,
  upvotes,
  tags,
  description,
  category,
  image,
}`);

export const UPVOTED_STARTUPS_BY_AUTHOR_QUERY =
  defineQuery(`*[_type == "author" && _id == $id][0].upvotedStartups[]->{
  _id, 
  title, 
  slug,
  _createdAt,
  author -> {
    _id, name, image, bio
  }, 
  views,
  upvotes,
  tags,
  description,
  category,
  image,
  isDraft
}`);

export const SAVED_STARTUPS_BY_AUTHOR_QUERY =
  defineQuery(`*[_type == "author" && _id == $id][0].savedStartups[]->{
  _id, 
  title, 
  slug,
  _createdAt,
  author -> {
    _id, name, image, bio
  }, 
  views,
  upvotes,
  tags,
  description,
  category,
  image,
  isDraft
}`);

// Optimized reel queries for profile tabs - only essential fields
export const REELS_BY_AUTHOR_QUERY = defineQuery(`
*[_type == "reel" && author._ref == $id] | order(_createdAt desc) {
  _id, 
  title,
  thumbnail,
  "views": coalesce(views, 0),
  "upvotes": coalesce(upvotes, 0),
  "commentCount": coalesce(commentCount, 0)
}`);

export const UPVOTED_REELS_BY_AUTHOR_QUERY = defineQuery(`
*[_type == "author" && _id == $id][0].upvotedReels[]->{
  _id, 
  title,
  thumbnail,
  "views": coalesce(views, 0),
  "upvotes": coalesce(upvotes, 0),
  "commentCount": coalesce(commentCount, 0)
}`);

export const SAVED_REELS_BY_AUTHOR_QUERY = defineQuery(`
*[_type == "author" && _id == $id][0].savedReels[]->{
  _id, 
  title,
  thumbnail,
  "views": coalesce(views, 0),
  "upvotes": coalesce(upvotes, 0),
  "commentCount": coalesce(commentCount, 0)
}`);



export const PLAYLIST_BY_SLUG_QUERY =
  defineQuery(`*[_type == "playlist" && slug.current == $slug][0]{
  _id,
  title,
  slug,
  select[]->{_id, _createdAt, title, slug, views, description, category, image, pitch, isDraft, author->{_id, name, slug, image, bio}} | {
    _id,
    title,
    slug,
    "select": select[coalesce(isDraft, false) == false]
  }
}`);

// Comments Queries
export const COMMENTS_BY_STARTUP_QUERY = defineQuery(`
*[_type == "comment" && startup._ref == $startupId && !defined(parentComment)] | order(_createdAt desc) {
  _id,
  content,
  _createdAt,
  upvotes,
  upvotedBy,
  author -> {
    _id,
    name,
    username,
    image
  },
  "replies": *[_type == "comment" && parentComment._ref == ^._id] | order(_createdAt asc) {
    _id,
    content,
    _createdAt,
    upvotes,
    upvotedBy,
    author -> {
      _id,
      name,
      username,
      image
    }
  }
}
`);

export const COMMENT_COUNT_QUERY = defineQuery(`
count(*[_type == "comment" && startup._ref == $startupId])
`);

// Reel Comments Query
export const COMMENTS_BY_REEL_QUERY = defineQuery(`
*[_type == "comment" && reel._ref == $reelId && !defined(parentComment)] | order(_createdAt desc) {
  _id,
  content,
  _createdAt,
  upvotes,
  upvotedBy,
  author -> {
    _id,
    name,
    username,
    image
  },
  "replies": *[_type == "comment" && parentComment._ref == ^._id] | order(_createdAt asc) {
    _id,
    content,
    _createdAt,
    upvotes,
    upvotedBy,
    author -> {
      _id,
      name,
      username,
      image
    }
  }
}
`);

// Notifications Queries
export const NOTIFICATIONS_BY_USER_QUERY = defineQuery(`
*[_type == "notification" && recipient._ref == $userId] | order(_createdAt desc) [0...50] {
  _id,
  type,
  message,
  read,
  _createdAt,
  milestoneType,
  milestoneValue,
  sender -> {
    _id,
    name,
    username,
    image
  },
  startup -> {
    _id,
    title,
    slug
  },
  reel -> {
    _id,
    title,
    slug
  },
  comment -> {
    _id,
    content
  }
}
`);

export const UNREAD_NOTIFICATION_COUNT_QUERY = defineQuery(`
count(*[_type == "notification" && recipient._ref == $userId && read == false])
`);

// Drafts Queries
export const DRAFTS_BY_AUTHOR_QUERY = defineQuery(`
*[_type == "startup" && author._ref == $id && isDraft == true] | order(_createdAt desc) {
  _id,
  title,
  description,
  category,
  image,
  _createdAt,
  scheduledFor
}
`);

// Stats Queries
export const AUTHOR_STATS_QUERY = defineQuery(`
*[_type == "author" && _id == $id][0]{
  _id,
  "totalPosts": count(*[_type == "startup" && author._ref == ^._id && coalesce(isDraft, false) == false]),
  "totalViews": coalesce(math::sum(*[_type == "startup" && author._ref == ^._id && coalesce(isDraft, false) == false].views), 0),
  "totalUpvotes": coalesce(math::sum(*[_type == "startup" && author._ref == ^._id && coalesce(isDraft, false) == false].upvotes), 0),
  "followerCount": count(coalesce(followers, [])),
  "followingCount": count(coalesce(following, []))
}
`);

export const AUTHOR_GROWTH_QUERY = defineQuery(`
*[_type == "startup" && author._ref == $id && coalesce(isDraft, false) == false] | order(_createdAt asc) {
  _createdAt,
  "views": coalesce(views, 0),
  "upvotes": coalesce(upvotes, 0),
  title
}
`);

// Reels stats queries
export const AUTHOR_REELS_STATS_QUERY = defineQuery(`
*[_type == "author" && _id == $id][0]{
  _id,
  "totalReels": count(*[_type == "reel" && author._ref == ^._id]),
  "totalReelViews": coalesce(math::sum(*[_type == "reel" && author._ref == ^._id].views), 0),
  "totalReelUpvotes": coalesce(math::sum(*[_type == "reel" && author._ref == ^._id].upvotes), 0),
  "totalComments": coalesce(math::sum(*[_type == "reel" && author._ref == ^._id].commentCount), 0)
}
`);

export const AUTHOR_REELS_GROWTH_QUERY = defineQuery(`
*[_type == "reel" && author._ref == $id] | order(_createdAt asc) {
  _createdAt,
  "views": coalesce(views, 0),
  "upvotes": coalesce(upvotes, 0),
  title
}
`);

// Reels queries - dedicated reel content
export const REELS_QUERY = defineQuery(`
*[_type == "reel"] | order(_createdAt desc) {
  _id, 
  title, 
  slug,
  _createdAt,
  author -> {
    _id, name, image, bio
  }, 
  views,
  description,
  category,
  videoUrl,
  thumbnail,
  duration,
  upvotes,
  upvotedBy,
  tags,
  commentCount
}
`);

// Enhanced reels query with user interactions  
export const REELS_WITH_USER_QUERY = defineQuery(`
*[_type == "reel"] | order(_createdAt desc) [0...10] {
  _id, 
  title, 
  _createdAt,
  author -> {
    _id, 
    name, 
    image,
    "isFollowing": select($userId != null => $userId in followers[]._ref, false)
  }, 
  "views": coalesce(views, 0),
  "upvotes": coalesce(upvotes, 0),
  description,
  videoUrl,
  thumbnail,
  duration,
  "commentCount": coalesce(commentCount, 0),
  "hasUpvoted": select($userId != null => $userId in upvotedBy[]._ref, false),
  "isSaved": select($userId != null => $userId in *[_type == "author" && _id == $userId][0].savedReels[]._ref, false)
}`);

// Add infinite scroll query for reels
export const REELS_INFINITE_QUERY = defineQuery(`
*[_type == "reel" && _createdAt < $lastCreatedAt] | order(_createdAt desc) [0...5] {
  _id, 
  title, 
  _createdAt,
  author -> {
    _id, 
    name, 
    image,
    "isFollowing": select($userId != null => $userId in followers[]._ref, false)
  }, 
  "views": coalesce(views, 0),
  "upvotes": coalesce(upvotes, 0),
  description,
  videoUrl,
  thumbnail,
  duration,
  "commentCount": coalesce(commentCount, 0),
  "hasUpvoted": select($userId != null => $userId in upvotedBy[]._ref, false),
  "isSaved": select($userId != null => $userId in *[_type == "author" && _id == $userId][0].savedReels[]._ref, false)
}`);

export const REELS_QUERY_PAGINATED = defineQuery(`
*[_type == "reel"] | order(_createdAt desc) [$offset...$limit] {
  _id, 
  title, 
  slug,
  _createdAt,
  author -> {
    _id, name, image, bio
  }, 
  views,
  description,
  category,
  videoUrl,
  thumbnail,
  duration,
  upvotes,
  tags,
  commentCount
}
`);