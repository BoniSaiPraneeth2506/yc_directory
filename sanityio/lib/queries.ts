import { defineQuery } from "next-sanity";

export const STARTUPS_QUERY =
  defineQuery(`*[_type == "startup" && defined(slug.current) && (!defined($search) || title match $search || category match $search || author->name match $search)] | order(_createdAt desc) {
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
  defineQuery(`*[_type == "startup" && defined(slug.current) && (!defined($search) || title match $search || category match $search || author->name match $search)] | order(views desc) {
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
  defineQuery(`*[_type == "startup" && defined(slug.current) && (!defined($search) || title match $search || category match $search || author->name match $search)] | order(coalesce(upvotes, 0) desc) {
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
  defineQuery(`*[_type == "startup" && defined(slug.current) && _createdAt > $weekAgo && (!defined($search) || title match $search || category match $search || author->name match $search)] | order(views desc, upvotes desc) {
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
  defineQuery(`*[_type == "startup" && defined(slug.current) && $tag in tags && (!defined($search) || title match $search || category match $search || author->name match $search)] | order(_createdAt desc) {
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
  defineQuery(`*[_type == "startup" && author._ref == $id] | order(_createdAt desc) {
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
  defineQuery(`*[_type == "author" && _id == $id][0].upvotedStartups[]-> {
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

export const SAVED_STARTUPS_BY_AUTHOR_QUERY =
  defineQuery(`*[_type == "author" && _id == $id][0].savedStartups[]-> {
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



export const PLAYLIST_BY_SLUG_QUERY =
  defineQuery(`*[_type == "playlist" && slug.current == $slug][0]{
  _id,
  title,
  slug,
  select[]->{
    _id,
    _createdAt,
    title,
    slug,
    author->{
      _id,
      name,
      slug,
      image,
      bio
    },
    views,
    description,
    category,
    image,
    pitch
  }
}`);