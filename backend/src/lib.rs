use worker::*;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Category {
    pub id: String,
    pub title: String,
    pub r#type: String, // 'clothing' or 'jewelry'
    pub image: Option<String>,
    pub tagline: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Product {
    pub id: String,
    pub title: String,
    pub category: String,
    pub r#type: String,
    pub image_src: Option<String>,
    pub price: Option<String>,
    pub description: Option<String>,
    pub is_starred: Option<bool>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct User {
    pub id: String,
    pub email: String,
    pub name: Option<String>,
    pub role: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct BespokeRequest {
    pub id: String,
    pub name: String,
    pub email: String,
    pub message: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ClientDiary {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub image: Option<String>,
}

#[event(fetch)]
pub async fn main(req: Request, env: Env, _ctx: worker::Context) -> Result<Response> {
    let router = Router::new();

    let _cors = Cors::new()
        .with_origins(vec!["http://localhost:3000", "http://localhost:3001"])
        .with_methods(vec![Method::Get, Method::Post, Method::Put, Method::Delete, Method::Options])
        .with_allowed_headers(vec!["*"]);

    router
        .options("/api/*any", |_, _| Response::empty()) // Handle CORS Preflight
        
        // --- CATEGORIES API ---
        .get_async("/api/categories", |_, ctx| async move {
            let d1 = ctx.env.d1("DB")?;
            let stmt = d1.prepare("SELECT * FROM categories ORDER BY created_at DESC");
            let result = stmt.all().await?;
            Response::from_json(&result.results::<serde_json::Value>()?)
        })
        .post_async("/api/categories", |mut req, ctx| async move {
            let cat: Category = req.json().await?;
            let d1 = ctx.env.d1("DB")?;
            
            let stmt = d1.prepare("INSERT INTO categories (id, title, type, image, tagline) VALUES (?1, ?2, ?3, ?4, ?5)")
                .bind(&[
                    cat.id.into(),
                    cat.title.into(),
                    cat.r#type.into(),
                    cat.image.unwrap_or_default().into(),
                    cat.tagline.unwrap_or_default().into(),
                ])?;
                
            stmt.run().await?;
            Response::ok("Category created")
        })
        .put_async("/api/categories/:id", |mut req, ctx| async move {
            let id = match ctx.param("id") {
                Some(id) => id.clone(),
                None => return Response::error("Bad Request", 400),
            };
            let cat: Category = req.json().await?;
            let d1 = ctx.env.d1("DB")?;
            
            let stmt = d1.prepare("UPDATE categories SET title = ?1, type = ?2, image = ?3, tagline = ?4 WHERE id = ?5")
                .bind(&[
                    cat.title.into(),
                    cat.r#type.into(),
                    cat.image.unwrap_or_default().into(),
                    cat.tagline.unwrap_or_default().into(),
                    id.into(),
                ])?;
            stmt.run().await?;
            Response::ok("Category updated")
        })
        .delete_async("/api/categories/:id", |_, ctx| async move {
            let id = match ctx.param("id") {
                Some(id) => id.clone(),
                None => return Response::error("Bad Request", 400),
            };
            let d1 = ctx.env.d1("DB")?;
            let stmt = d1.prepare("DELETE FROM categories WHERE id = ?1").bind(&[id.into()])?;
            stmt.run().await?;
            Response::ok("Category deleted")
        })

        // --- PRODUCTS API ---
        .get_async("/api/products", |_, ctx| async move {
            let d1 = ctx.env.d1("DB")?;
            let stmt = d1.prepare("SELECT * FROM products ORDER BY created_at DESC");
            let result = stmt.all().await?;
            Response::from_json(&result.results::<serde_json::Value>()?)
        })
        .post_async("/api/products", |mut req, ctx| async move {
            let prod: Product = req.json().await?;
            let d1 = ctx.env.d1("DB")?;
            let is_starred = prod.is_starred.unwrap_or(false);
            
            let stmt = d1.prepare("INSERT INTO products (id, title, category, type, imageSrc, price, description, isStarred, starredAt) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)")
                .bind(&[
                    prod.id.into(),
                    prod.title.into(),
                    prod.category.into(),
                    prod.r#type.into(),
                    prod.image_src.unwrap_or_default().into(),
                    prod.price.unwrap_or_default().into(),
                    prod.description.unwrap_or_default().into(),
                    (is_starred as i32).into(), // bool to int
                    (if is_starred { 1 } else { 0 }).into(), // dummy timestamp
                ])?;
                
            stmt.run().await?;
            Response::ok("Product created")
        })
        .put_async("/api/products/:id", |mut req, ctx| async move {
            let id = match ctx.param("id") {
                Some(id) => id.clone(),
                None => return Response::error("Bad Request", 400),
            };
            let prod: Product = req.json().await?;
            let d1 = ctx.env.d1("DB")?;
            let is_starred = prod.is_starred.unwrap_or(false);
            
            let stmt = d1.prepare("UPDATE products SET title = ?1, category = ?2, type = ?3, imageSrc = ?4, price = ?5, description = ?6, isStarred = ?7 WHERE id = ?8")
                .bind(&[
                    prod.title.into(),
                    prod.category.into(),
                    prod.r#type.into(),
                    prod.image_src.unwrap_or_default().into(),
                    prod.price.unwrap_or_default().into(),
                    prod.description.unwrap_or_default().into(),
                    (is_starred as i32).into(),
                    id.into(),
                ])?;
            stmt.run().await?;
            Response::ok("Product updated")
        })
        .delete_async("/api/products/:id", |_, ctx| async move {
            let id = match ctx.param("id") {
                Some(id) => id.clone(),
                None => return Response::error("Bad Request", 400),
            };
            let d1 = ctx.env.d1("DB")?;
            let stmt = d1.prepare("DELETE FROM products WHERE id = ?1").bind(&[id.into()])?;
            stmt.run().await?;
            Response::ok("Product deleted")
        })

        // --- USERS API ---
        .get_async("/api/users", |_, ctx| async move {
            let d1 = ctx.env.d1("DB")?;
            let stmt = d1.prepare("SELECT * FROM users ORDER BY created_at DESC");
            let result = stmt.all().await?;
            Response::from_json(&result.results::<serde_json::Value>()?)
        })
        .post_async("/api/users", |mut req, ctx| async move {
            let user: User = req.json().await?;
            let d1 = ctx.env.d1("DB")?;
            
            let stmt = d1.prepare("INSERT INTO users (id, email, name, role) VALUES (?1, ?2, ?3, ?4)")
                .bind(&[
                    user.id.into(),
                    user.email.into(),
                    user.name.unwrap_or_default().into(),
                    user.role.unwrap_or_else(|| "user".to_string()).into(),
                ])?;
                
            stmt.run().await?;
            Response::ok("User created")
        })
        .put_async("/api/users/:id", |mut req, ctx| async move {
            let id = match ctx.param("id") {
                Some(id) => id.clone(),
                None => return Response::error("Bad Request", 400),
            };
            let user: User = req.json().await?;
            let d1 = ctx.env.d1("DB")?;
            
            let stmt = d1.prepare("UPDATE users SET email = ?1, name = ?2, role = ?3 WHERE id = ?4")
                .bind(&[
                    user.email.into(),
                    user.name.unwrap_or_default().into(),
                    user.role.unwrap_or_else(|| "user".to_string()).into(),
                    id.into(),
                ])?;
            stmt.run().await?;
            Response::ok("User updated")
        })
        .delete_async("/api/users/:id", |_, ctx| async move {
            let id = match ctx.param("id") {
                Some(id) => id.clone(),
                None => return Response::error("Bad Request", 400),
            };
            let d1 = ctx.env.d1("DB")?;
            let stmt = d1.prepare("DELETE FROM users WHERE id = ?1").bind(&[id.into()])?;
            stmt.run().await?;
            Response::ok("User deleted")
        })

        // --- BESPOKE REQUESTS API ---
        .get_async("/api/bespoke", |_, ctx| async move {
            let d1 = ctx.env.d1("DB")?;
            let stmt = d1.prepare("SELECT * FROM bespoke_requests ORDER BY created_at DESC");
            let result = stmt.all().await?;
            Response::from_json(&result.results::<serde_json::Value>()?)
        })
        .post_async("/api/bespoke", |mut req, ctx| async move {
            let req_data: BespokeRequest = req.json().await?;
            let d1 = ctx.env.d1("DB")?;
            
            let stmt = d1.prepare("INSERT INTO bespoke_requests (id, name, email, message) VALUES (?1, ?2, ?3, ?4)")
                .bind(&[
                    req_data.id.into(),
                    req_data.name.into(),
                    req_data.email.into(),
                    req_data.message.into(),
                ])?;
                
            stmt.run().await?;
            Response::ok("Bespoke request created")
        })

        // --- CLIENT DIARIES API ---
        .get_async("/api/client-diaries", |_, ctx| async move {
            let d1 = ctx.env.d1("DB")?;
            let stmt = d1.prepare("SELECT * FROM client_diaries ORDER BY created_at DESC");
            let result = stmt.all().await?;
            Response::from_json(&result.results::<serde_json::Value>()?)
        })
        .post_async("/api/client-diaries", |mut req, ctx| async move {
            let diary: ClientDiary = req.json().await?;
            let d1 = ctx.env.d1("DB")?;
            
            let stmt = d1.prepare("INSERT INTO client_diaries (id, title, description, image) VALUES (?1, ?2, ?3, ?4)")
                .bind(&[
                    diary.id.into(),
                    diary.title.into(),
                    diary.description.unwrap_or_default().into(),
                    diary.image.unwrap_or_default().into(),
                ])?;
                
            stmt.run().await?;
            Response::ok("Client diary created")
        })

        // --- SETTINGS API ---
        .get_async("/api/settings", |_, ctx| async move {
            let d1 = match ctx.env.d1("DB") {
                Ok(db) => db,
                Err(e) => return Response::error(e.to_string(), 500),
            };
            let stmt = match d1.prepare("SELECT value FROM settings WHERE key = ?1").bind(&["global".into()]) {
                Ok(s) => s,
                Err(e) => return Response::error(e.to_string(), 500),
            };
            let result = match stmt.all().await {
                Ok(r) => r,
                Err(e) => return Response::error(e.to_string(), 500),
            };
            let rows = match result.results::<serde_json::Value>() {
                Ok(r) => r,
                Err(e) => return Response::error(e.to_string(), 500),
            };
            if let Some(first_row) = rows.first() {
                if let Some(val) = first_row.get("value") {
                    match val {
                        serde_json::Value::String(s) => {
                            if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(s) {
                                return Response::from_json(&parsed);
                            }
                        }
                        serde_json::Value::Object(_) | serde_json::Value::Array(_) => {
                            return Response::from_json(val);
                        }
                        _ => {}
                    }
                }
            }
            Response::from_json(&serde_json::json!({}))
        })
        .post_async("/api/settings", |mut req, ctx| async move {
            let incoming: serde_json::Value = match req.json().await {
                Ok(val) => val,
                Err(e) => return Response::error(format!("Invalid JSON body: {}", e), 400),
            };
            let d1 = match ctx.env.d1("DB") {
                Ok(db) => db,
                Err(e) => return Response::error(e.to_string(), 500),
            };

            let existing_stmt = match d1.prepare("SELECT value FROM settings WHERE key = ?1").bind(&["global".into()]) {
                Ok(s) => s,
                Err(e) => return Response::error(e.to_string(), 500),
            };
            let existing_rows = match existing_stmt.all().await {
                Ok(res) => res.results::<serde_json::Value>().unwrap_or_default(),
                Err(_) => Vec::new(),
            };

            let mut existing_val: Option<serde_json::Value> = None;
            if let Some(first_row) = existing_rows.first() {
                if let Some(val) = first_row.get("value") {
                    match val {
                        serde_json::Value::String(s) => {
                            if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(s) {
                                existing_val = Some(parsed);
                            }
                        }
                        serde_json::Value::Object(_) => {
                            existing_val = Some(val.clone());
                        }
                        _ => {}
                    }
                }
            }

            let final_value = match (existing_val, incoming) {
                (Some(serde_json::Value::Object(mut existing_map)), serde_json::Value::Object(incoming_map)) => {
                    for (k, v) in incoming_map {
                        existing_map.insert(k, v);
                    }
                    serde_json::Value::Object(existing_map)
                }
                (_, incoming) => incoming,
            };

            let value_str = match serde_json::to_string(&final_value) {
                Ok(s) => s,
                Err(e) => return Response::error(format!("Failed to serialize settings: {}", e), 500),
            };

            let upsert_stmt = match d1.prepare(
                "INSERT INTO settings (key, value, updated_at) VALUES ('global', ?1, CURRENT_TIMESTAMP) \
                 ON CONFLICT(key) DO UPDATE SET value = ?1, updated_at = CURRENT_TIMESTAMP"
            ).bind(&[value_str.into()]) {
                Ok(s) => s,
                Err(e) => return Response::error(e.to_string(), 500),
            };

            match upsert_stmt.run().await {
                Ok(_) => Response::from_json(&serde_json::json!({
                    "success": true,
                    "message": "Settings updated successfully",
                    "data": final_value
                })),
                Err(e) => Response::error(e.to_string(), 500),
            }
        })
        
        .run(req, env)
        .await
        .and_then(|mut resp| {
            let _ = resp.headers_mut().set("Access-Control-Allow-Origin", "*");
            let _ = resp.headers_mut().set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            let _ = resp.headers_mut().set("Access-Control-Allow-Headers", "*");
            Ok(resp)
        })
}
