function enqueue_chatbot_script() {
    $version = filemtime(get_stylesheet_directory() . '/js/chatbot.js'); // Cache busting

    // Enqueue chatbot.js
    wp_enqueue_script(
        'chatbot-script',
        get_stylesheet_directory_uri() . '/js/chatbot.js',
        array('jquery'), // Dependencies
        $version,
        true
    );

    // Pass AJAX URL to chatbot.js
    wp_localize_script('chatbot-script', 'chatbotAjax', array(
        'ajaxurl' => admin_url('admin-ajax.php'),
    ));
}
add_action('wp_enqueue_scripts', 'enqueue_chatbot_script');


// search in post/page
function chatbot_search_query() {
    if (!isset($_POST['message'])) {
        wp_send_json_error(['response' => 'Invalid request']);
        wp_die();
    }

    $search_query = sanitize_text_field($_POST['message']);

    // Extract important keywords from the user input
    $search_query = chatbot_extract_keywords($search_query);

    // Search WordPress posts and pages
    $args = array(
        'post_type'      => array('post', 'page'),
        'posts_per_page' => 5,
        's'              => $search_query
    );

    $query = new WP_Query($args);

    if ($query->have_posts()) {
        $results = [];
        while ($query->have_posts()) {
            $query->the_post();
            $results[] = '<a href="' . get_permalink() . '" target="_blank">' . get_the_title() . '</a>';
        }
        wp_reset_postdata();

        wp_send_json_success(['response' => 'Here are some related articles: <br>' . implode('<br>', $results)]);
    } else {
        wp_send_json_success(['response' => "Sorry, I couldn't find any relevant resources."]);
    }

    wp_die();
}

// Function to extract keywords
function chatbot_extract_keywords($text) {
    // Convert to lowercase and remove special characters
    $text = strtolower($text);
    $text = preg_replace('/[^\w\s]/', '', $text); // Remove punctuation

    // List of common words to ignore (stop words)
    $stop_words = ['what', 'how', 'where', 'about', 'to', 'is', 'a', 'an', 'the', 'can', 'i', 'you', 'know', 'want', 'need'];

    // Split sentence into words
    $words = explode(" ", $text);

    // Remove stop words
    $filtered_words = array_diff($words, $stop_words);

    // If we still have words left, return the most relevant keyword(s)
    if (!empty($filtered_words)) {
        return implode(" ", $filtered_words); // Return cleaned-up phrase
    }

    // If everything got removed, return original input as a fallback
    return $text;
}


// Register AJAX actions
add_action('wp_ajax_chatbot_search_query', 'chatbot_search_query');
add_action('wp_ajax_nopriv_chatbot_search_query', 'chatbot_search_query');

