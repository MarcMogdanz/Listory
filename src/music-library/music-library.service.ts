import { Injectable } from "@nestjs/common";
import { PostgresErrorCodes } from "../database/error-codes";
import { Album } from "./album.entity";
import { AlbumRepository } from "./album.repository";
import { Artist } from "./artist.entity";
import { ArtistRepository } from "./artist.repository";
import { CreateAlbumDto } from "./dto/create-album.dto";
import { CreateArtistDto } from "./dto/create-artist.dto";
import { CreateGenreDto } from "./dto/create-genre.dto";
import { CreateTrackDto } from "./dto/create-track.dto";
import { FindAlbumDto } from "./dto/find-album.dto";
import { FindArtistDto } from "./dto/find-artist.dto";
import { FindGenreDto } from "./dto/find-genre.dto";
import { FindTrackDto } from "./dto/find-track.dto";
import { UpdateArtistDto } from "./dto/update-artist.dto";
import { Genre } from "./genre.entity";
import { GenreRepository } from "./genre.repository";
import { Track } from "./track.entity";
import { TrackRepository } from "./track.repository";

@Injectable()
export class MusicLibraryService {
  constructor(
    private readonly albumRepository: AlbumRepository,
    private readonly artistRepository: ArtistRepository,
    private readonly genreRepository: GenreRepository,
    private readonly trackRepository: TrackRepository
  ) {}

  async findArtist(query: FindArtistDto): Promise<Artist | undefined> {
    return this.artistRepository.findOneBy({
      spotify: { id: query.spotify.id },
    });
  }

  async getArtistWithOldestUpdate(): Promise<Artist | undefined> {
    const [oldestArtist] = await this.artistRepository.find({
      take: 1,
      order: {
        updatedAt: "ASC",
      },
    });

    return oldestArtist;
  }

  async createArtist(data: CreateArtistDto): Promise<Artist> {
    const artist = this.artistRepository.create();

    artist.name = data.name;
    artist.genres = data.genres;
    artist.spotify = data.spotify;

    try {
      await this.artistRepository.save(artist);
    } catch (err) {
      if (
        err.code === PostgresErrorCodes.UNIQUE_VIOLATION &&
        err.constraint === "IDX_ARTIST_SPOTIFY_ID"
      ) {
        // Multiple simultaneous importArtist calls for the same artist were
        // executed and it is now available in the database for use to retrieve
        return this.findArtist({ spotify: { id: data.spotify.id } });
      }

      throw err;
    }

    return artist;
  }

  async updateArtist({
    artist,
    updatedFields,
  }: UpdateArtistDto): Promise<Artist> {
    artist.name = updatedFields.name;
    artist.genres = updatedFields.genres;
    artist.updatedAt = new Date();

    return this.artistRepository.save(artist);
  }

  async findAlbum(query: FindAlbumDto): Promise<Album | undefined> {
    return this.albumRepository.findOneBy({
      spotify: { id: query.spotify.id },
    });
  }

  async createAlbum(data: CreateAlbumDto): Promise<Album> {
    const album = this.albumRepository.create();

    album.name = data.name;
    album.artists = data.artists;
    album.spotify = data.spotify;

    try {
      await this.albumRepository.save(album);
    } catch (err) {
      if (
        err.code === PostgresErrorCodes.UNIQUE_VIOLATION &&
        err.constraint === "IDX_ALBUM_SPOTIFY_ID"
      ) {
        // Multiple simultaneous importAlbum calls for the same album were
        // executed and it is now available in the database for use to retrieve
        return this.findAlbum({ spotify: { id: data.spotify.id } });
      }

      throw err;
    }

    return album;
  }

  async findGenre(query: FindGenreDto): Promise<Genre | undefined> {
    return this.genreRepository.findOneBy({
      name: query.name,
    });
  }

  async createGenre(data: CreateGenreDto): Promise<Genre> {
    const genre = this.genreRepository.create();

    genre.name = data.name;

    try {
      await this.genreRepository.save(genre);
    } catch (err) {
      if (
        err.code === PostgresErrorCodes.UNIQUE_VIOLATION &&
        err.constraint === "IDX_GENRE_NAME"
      ) {
        // Multiple simultaneous importGenre calls for the same genre were
        // executed and it is now available in the database for use to retrieve
        return this.findGenre({ name: data.name });
      }

      throw err;
    }

    return genre;
  }

  async findTrack(query: FindTrackDto): Promise<Track | undefined> {
    return this.trackRepository.findOneBy({
      spotify: { id: query.spotify.id },
    });
  }

  async createTrack(data: CreateTrackDto): Promise<Track> {
    const track = this.trackRepository.create();

    track.name = data.name;
    track.artists = data.artists;
    track.album = data.album;
    track.spotify = data.spotify;

    try {
      await this.trackRepository.save(track);
    } catch (err) {
      if (
        err.code === PostgresErrorCodes.UNIQUE_VIOLATION &&
        err.constraint === "IDX_TRACK_SPOTIFY_ID"
      ) {
        // Multiple simultaneous findTrack calls for the same track were
        // executed and it is now available in the database for use to retrieve
        return this.findTrack({ spotify: { id: data.spotify.id } });
      }

      throw err;
    }

    return track;
  }
}
