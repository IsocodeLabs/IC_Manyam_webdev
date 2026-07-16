export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          role: 'Admin' | 'Content Manager' | 'Marketer'
          created_at: string | null
        }
        Insert: {
          id: string
          name: string
          email: string
          role: 'Admin' | 'Content Manager' | 'Marketer'
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: 'Admin' | 'Content Manager' | 'Marketer'
          created_at?: string | null
        }
        // The foreign key targets auth.users, which is outside the public schema.
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          parent_id: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          parent_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      tags: {
        Row: {
          id: string
          name: string
          slug: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      pages: {
        Row: {
          id: string
          title: string
          slug: string
          type: 'Landing' | 'Category' | 'Standard' | 'Form' | 'Legal'
          status: 'Draft' | 'Published'
          content: Json | null
          seo_meta: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          slug: string
          type: 'Landing' | 'Category' | 'Standard' | 'Form' | 'Legal'
          status?: 'Draft' | 'Published'
          content?: Json | null
          seo_meta?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          type?: 'Landing' | 'Category' | 'Standard' | 'Form' | 'Legal'
          status?: 'Draft' | 'Published'
          content?: Json | null
          seo_meta?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          id: string
          title: string
          slug: string
          category_id: string | null
          status: 'Draft' | 'Published' | 'Scheduled'
          content: string | null
          seo_meta: Json | null
          scheduled_at: string | null
          published_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          title: string
          slug: string
          category_id?: string | null
          status?: 'Draft' | 'Published' | 'Scheduled'
          content?: string | null
          seo_meta?: Json | null
          scheduled_at?: string | null
          published_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          category_id?: string | null
          status?: 'Draft' | 'Published' | 'Scheduled'
          content?: string | null
          seo_meta?: Json | null
          scheduled_at?: string | null
          published_at?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      post_tags: {
        Row: {
          post_id: string
          tag_id: string
        }
        Insert: {
          post_id: string
          tag_id: string
        }
        Update: {
          post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          }
        ]
      }
      post_revisions: {
        Row: {
          id: string
          post_id: string
          title: string
          content: string
          seo_meta: Json | null
          saved_by: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          post_id: string
          title: string
          content: string
          seo_meta?: Json | null
          saved_by?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          post_id?: string
          title?: string
          content?: string
          seo_meta?: Json | null
          saved_by?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_revisions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_revisions_saved_by_fkey"
            columns: ["saved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      packages: {
        Row: {
          id: string
          title: string
          slug: string
          type: 'Festival' | 'Destination' | 'Honeymoon' | 'Wildlife' | 'Wellness'
          description: string | null
          itinerary: Json | null
          availability: Json | null
          featured_image_url: string | null
          seo_meta: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          title: string
          slug: string
          type: 'Festival' | 'Destination' | 'Honeymoon' | 'Wildlife' | 'Wellness'
          description?: string | null
          itinerary?: Json | null
          availability?: Json | null
          featured_image_url?: string | null
          seo_meta?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          type?: 'Festival' | 'Destination' | 'Honeymoon' | 'Wildlife' | 'Wellness'
          description?: string | null
          itinerary?: Json | null
          availability?: Json | null
          featured_image_url?: string | null
          seo_meta?: Json | null
          created_at?: string | null
        }
        Relationships: []
      }
      media: {
        Row: {
          id: string
          file_url: string
          alt_text: string
          caption: string | null
          width: number | null
          height: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          file_url: string
          alt_text: string
          caption?: string | null
          width?: number | null
          height?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          file_url?: string
          alt_text?: string
          caption?: string | null
          width?: number | null
          height?: number | null
          created_at?: string | null
        }
        Relationships: []
      }
      redirects: {
        Row: {
          id: string
          from_path: string
          to_path: string
          status_code: 301 | 302
          created_at: string | null
        }
        Insert: {
          id?: string
          from_path: string
          to_path: string
          status_code: 301 | 302
          created_at?: string | null
        }
        Update: {
          id?: string
          from_path?: string
          to_path?: string
          status_code?: 301 | 302
          created_at?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          value: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          key: string
          value: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          key?: string
          value?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      clusters: {
        Row: {
          id: string
          name: string
          pillar_page_id: string | null
        }
        Insert: {
          id?: string
          name: string
          pillar_page_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          pillar_page_id?: string | null
        }
        Relationships: []
      }
      cluster_items: {
        Row: {
          id: string
          cluster_id: string
          page_id: string | null
          post_id: string | null
          package_id: string | null
        }
        Insert: {
          id?: string
          cluster_id: string
          page_id?: string | null
          post_id?: string | null
          package_id?: string | null
        }
        Update: {
          id?: string
          cluster_id?: string
          page_id?: string | null
          post_id?: string | null
          package_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cluster_items_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "clusters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cluster_items_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cluster_items_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cluster_items_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          }
        ]
      }
      internal_links: {
        Row: {
          id: string
          source_id: string
          target_id: string
          anchor_text: string
          created_at: string | null
        }
        Insert: {
          id?: string
          source_id: string
          target_id: string
          anchor_text: string
          created_at?: string | null
        }
        Update: {
          id?: string
          source_id?: string
          target_id?: string
          anchor_text?: string
          created_at?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          id: string
          source: 'Contact Form' | 'AI Chat'
          source_page: string
          name: string
          email: string
          message: string | null
          status: 'New' | 'Contacted' | 'Proposal' | 'Won' | 'Lost'
          created_at: string | null
        }
        Insert: {
          id?: string
          source: 'Contact Form' | 'AI Chat'
          source_page: string
          name: string
          email: string
          message?: string | null
          status?: 'New' | 'Contacted' | 'Proposal' | 'Won' | 'Lost'
          created_at?: string | null
        }
        Update: {
          id?: string
          source?: 'Contact Form' | 'AI Chat'
          source_page?: string
          name?: string
          email?: string
          message?: string | null
          status?: 'New' | 'Contacted' | 'Proposal' | 'Won' | 'Lost'
          created_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      publish_scheduled_posts: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
